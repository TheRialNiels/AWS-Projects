import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda'

import { PromptSchema, type Prompt } from '@/interfaces/prompts.types'
import { errorResponse, httpStatusCodes } from '@/lib/httpResponse.lib'
import { generateUuid } from '@/lib/uuid.lib'
import { returnFlattenError, validateSchema } from '@/lib/utils.lib'
import { OpenAIResponsesClient } from '@/clients/openAIResponses.client'

const openAIClient = new OpenAIResponsesClient()

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResult> => {
  const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatusCodes

  try {
    // * Get the body payload from request
    const body: Prompt = JSON.parse(event.body || '{}')
    // * Get threadId from request if not generate a new id
    body.threadId = body.threadId || generateUuid()
    // * Generate a new createdAt date
    const now = new Date().toISOString()
    body.createdAt = now

    // * Validate payload with schema
    const schemaValidation = validateSchema(PromptSchema, body)
    if (schemaValidation.error) {
      const errors = returnFlattenError(schemaValidation.error)
      return errorResponse({
        statusCode: BAD_REQUEST,
        message: 'Invalid request payload',
        responseData: { message: errors },
      })
    }

    const response = openAIClient.generateText(
      'Explain black holes in simple terms.',
    )

    for await (const chunk of response) {
      process.stdout.write(chunk) // or append to UI, etc.
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'hello world',
      }),
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    }
  }
}
