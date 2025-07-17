import { OpenAIResponsesClient } from '@/clients/openAIResponses.client'
import { PromptsDbClient } from '@/clients/promptsDb.client'
import {
  PromptPayloadSchema,
  type Prompt,
  type PromptPayload,
} from '@/interfaces/prompts.types'
import { promptsEnvs } from '@/lib/env.lib'
import { returnFlattenError, validateSchema } from '@/lib/utils.lib'
import { generateUuid } from '@/lib/uuid.lib'

const openAIClient = new OpenAIResponsesClient()
const promptsDbClient = new PromptsDbClient({
  region: promptsEnvs.REGION,
  table: promptsEnvs.PROMPTS_TABLE,
})

export const handler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    try {
      responseStream.setContentType('text/event-stream')
      const userCreatedAt = new Date().toISOString()

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

      // * Generate streaming response from OpenAI
      let responseId
      let fullResponse = ''
      const responseGenerator = openAIClient.generateText(body.prompt)

      for await (const chunk of responseGenerator) {
        if (chunk.type === 'response.output_text.delta' && chunk.delta) {
          responseId = chunk.item_id
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
        responseId: responseId,
      }
      await promptsDbClient.createPrompt(userItem)

      // * Save assistant response to database
      const assistantCreatedAt = new Date().toISOString()
      const assistantItem: Prompt = {
        threadId: body.threadId,
        createdAt: assistantCreatedAt,
        role: 'assistant',
        content: fullResponse,
        responseId: responseId,
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
