import { BookIdSchema, type DeleteItemParams } from '@interfaces/books.types'
import {
  createCORSHeaders,
  createPreflightResponse,
  getOriginFromEvent,
} from '@lib/cors'
import {
  errorResponse,
  httpStatusCodes,
  successResponse,
} from '@lib/httpResponse'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { BooksDynamoDBClient } from '@lib/booksDynamoDBClient'
import { env } from '@lib/packages/env'
import { returnFlattenError, validateSchema } from '@lib/packages/zod'

const dynamoDbConfig = {
  region: env.REGION,
  tableName: env.BOOKS_TABLE,
  titleGsi: env.BOOKS_TITLE_GSI,
  authorGsi: env.BOOKS_AUTHOR_GSI,
}
const dynamoDBClient = new BooksDynamoDBClient(dynamoDbConfig)

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const origin = getOriginFromEvent(event)
  const methods = ['DELETE', 'OPTIONS']
  const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatusCodes

  // * Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return createPreflightResponse(origin)
  }

  // * Validate the HTTP method
  if (methods.indexOf(event.httpMethod) === -1) {
    return errorResponse({
      statusCode: BAD_REQUEST,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Invalid request method',
      responseData: {
        message: `Only ${methods.join(', ')} methods are allowed`,
      },
    })
  }

  // * Get id param from request
  const id = event.pathParameters?.id

  try {
    // * Validate id with schema
    const schemaValidation = validateSchema(BookIdSchema, id)
    if (schemaValidation.error) {
      const error = returnFlattenError(schemaValidation.error)
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Invalid request',
        responseData: { message: error },
      })
    }

    // * Prepare the params to delete the item in DynamoDB
    const params: DeleteItemParams = {
      key: { id: { S: id } },
    }

    // * Delete item in DynamoDB
    await dynamoDBClient.deleteItem(params)

    // * Return success response
    return successResponse({
      statusCode: OK,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Book deleted successfully',
      responseData: { id },
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    if (err.name === 'ConditionalCheckFailedException') {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Book not found',
        responseData: { id },
      })
    }

    return errorResponse({
      statusCode: err.$metadata
        ? err.$metadata.httpStatusCode
        : INTERNAL_SERVER_ERROR,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Error deleting the book',
      responseData: { message: 'Unexpected error' },
    })
  }
}
