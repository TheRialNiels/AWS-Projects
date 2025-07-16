import { PromptSchema, type Prompt } from '@/interfaces/prompts.types'
import { generateUuid } from '@/lib/uuid.lib'
import { returnFlattenError, validateSchema } from '@/lib/utils.lib'
import { OpenAIResponsesClient } from '@/clients/openAIResponses.client'
// import { DynamoDbClient } from '@/clients/dynamoDb.client'
// import { promptsEnvs } from '@/lib/env.lib'

const openAIClient = new OpenAIResponsesClient()
// const dynamoClient = new DynamoDbClient({
//   region: promptsEnvs.REGION,
//   promptsTable: promptsEnvs.PROMPTS_TABLE,
//   threadsTable: promptsEnvs.THREADS_TABLE,
// })

export const handler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    try {
      responseStream.setContentType('text/event-stream')

      // * Parse request body
      const body: Prompt = JSON.parse(event.body || '{}')
      body.threadId = body.threadId || generateUuid()
      body.createdAt = new Date().toISOString()

      // * Validate payload
      const schemaValidation = validateSchema(PromptSchema, body)
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

      // * Save user prompt to database
      //   await dynamoClient.createPrompt({
      //     threadId: body.threadId,
      //     createdAt: body.createdAt,
      //     role: 'user',
      //     content: body.prompt,
      //   })

      // * Generate streaming response from OpenAI
      let fullResponse = ''
      const responseGenerator = openAIClient.generateText(body.prompt)

      for await (const chunk of responseGenerator) {
        fullResponse += chunk

        // * Send chunk to client
        const chunkData = JSON.stringify({
          type: 'response',
          content: chunk,
        })
        responseStream.write(`data: ${chunkData}\n\n`)
      }

      // * Save assistant response to database
      //   await dynamoClient.createPrompt({
      //     threadId: body.threadId,
      //     createdAt: new Date().toISOString(),
      //     role: 'assistant',
      //     content: fullResponse,
      //   })

      // * Send completion event
      const endData = JSON.stringify({
        type: 'end',
        threadId: body.threadId,
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
