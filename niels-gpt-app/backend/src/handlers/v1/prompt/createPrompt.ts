import { OpenAIResponsesClient } from '@/clients/openAIResponses.client'
import { PromptsDbClient } from '@/clients/promptsDb.client'
import { ThreadsDbClient } from '@/clients/threadsDb.client'
import {
  Prompt,
  PromptPayloadSchema,
  type PromptPayload,
} from '@/interfaces/prompts.types'
import { Thread } from '@/interfaces/threads.types'
import { promptsEnvs } from '@/lib/env.lib'
import { returnFlattenError, validateSchema } from '@/lib/utils.lib'
import { generateUuid } from '@/lib/uuid.lib'

const openAIClient = new OpenAIResponsesClient()
const promptsDbClient = new PromptsDbClient({
  region: promptsEnvs.REGION,
  table: promptsEnvs.PROMPTS_TABLE,
})
const threadsDbClient = new ThreadsDbClient({
  region: promptsEnvs.REGION,
  table: promptsEnvs.THREADS_TABLE,
})

await openAIClient.initializeOpenAI()

export const handler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    try {
      responseStream.setContentType('text/event-stream')
      let newResponseId, oldResponseId
      const userCreatedAt = new Date().toISOString()
      const userId = '47cd26e2-abb7-40f5-855a-ea5014169ca7'

      // * Parse request body
      const body: PromptPayload = JSON.parse(event.body || '{}')
      body.threadId = body.threadId || generateUuid()

      // * Validate payload
      const schemaValidation = validateSchema(PromptPayloadSchema, body)
      if (schemaValidation.error) {
        const errors = returnFlattenError(schemaValidation.error)
        const errorData = JSON.stringify({
          type: 'error',
          message: 'Invalid request payload',
          errors,
        })
        responseStream.write(`error_data: ${errorData}\n\n`)
        responseStream.end()
        return
      }

      // * Send start event
      const startData = JSON.stringify({
        type: 'start',
        threadId: body.threadId,
      })
      responseStream.write(`data: ${startData}\n\n`)

      // * Verify if the threadId already exists
      const threadExists = await threadsDbClient.verifyThreadExists(
        userId,
        body.threadId,
      )
      if (!threadExists) {
        // * Generate thread title
        const threadTitle = await openAIClient.generateThreadTitle(body.prompt)

        // * Save thread title to database
        const threadItem: Thread = {
          userId,
          threadId: body.threadId,
          createdAt: userCreatedAt,
          title: threadTitle,
        }
        await threadsDbClient.createThread(threadItem)
      }

      // * Get latest two prompts if threadId already exists
      if (threadExists) {
        const latestPrompts = await promptsDbClient.getLatestPrompts(
          body.threadId,
        )

        // * Set the previous responseId
        latestPrompts.forEach((prompt) => {
          if (prompt.role.S === 'user') {
            oldResponseId = prompt.responseId.S
          }
        })
      }

      // * Generate streaming response from OpenAI
      let fullResponse = ''
      const promptResponse = openAIClient.generateText(
        body.prompt,
        oldResponseId,
      )

      // * Stream the response
      for await (const chunk of promptResponse) {
        // * Set responseId if it's created
        if (chunk.type === 'response.created') {
          newResponseId = chunk.response.id
        }

        // * Return prompt messages and save them to fullResponse
        if (chunk.type === 'response.output_text.delta' && chunk.delta) {
          fullResponse += chunk.delta

          // * Send chunk to client
          const chunkData = JSON.stringify({
            type: 'response',
            content: chunk.delta,
          })
          responseStream.write(`data: ${chunkData}\n\n`)
        }
      }

      // * Save user prompt to database
      const userItem: Prompt = {
        id: generateUuid(),
        threadId: body.threadId,
        createdAt: userCreatedAt,
        role: 'user',
        content: body.prompt,
        responseId: newResponseId,
      }
      await promptsDbClient.createPrompt(userItem)

      // * Save assistant response to database
      const assistantCreatedAt = new Date().toISOString()
      const assistantItem: Prompt = {
        threadId: body.threadId,
        createdAt: assistantCreatedAt,
        role: 'assistant',
        content: fullResponse,
        responseId: newResponseId,
      }
      await promptsDbClient.createPrompt(assistantItem)

      // * Send completion event
      const endData = JSON.stringify({
        type: 'end',
        threadId: body.threadId,
        messageId: userItem.id,
      })
      responseStream.write(`data: ${endData}\n\n`)
      responseStream.end()
    } catch (error) {
      console.error('Streaming error:', error)
      const errorData = JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      responseStream.write(`error_data: ${errorData}\n\n`)
      responseStream.end()
    }
  },
)
