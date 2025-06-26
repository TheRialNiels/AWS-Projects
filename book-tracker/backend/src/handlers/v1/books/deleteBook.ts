import {
  Book,
  type DeleteItemParams,
} from '@interfaces/books.types'
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

const dynamoDbConfig = {
  region: env.REGION,
  tableName: env.BOOKS_TABLE,
  userBookKeyGsi: env.BOOKS_USER_BOOK_KEY_GSI,
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

  // * Get params from request
  const bookId = event.pathParameters?.bookId
  const body: Book = JSON.parse(event.body || '{}')
  const userId = body.userId

  try {
    if (!bookId || !userId) {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Missing required parameters',
        responseData: { message: 'userId and bookId are required' },
      })
    }

    // * Prepare the params to delete the item in DynamoDB
    const params: DeleteItemParams = {
      key: {
        userId: { S: userId },
        bookId: { S: bookId },
      },
    }

    // * Delete item in DynamoDB
    await dynamoDBClient.deleteItem(params)

    // * Return success response
    return successResponse({
      statusCode: OK,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Book deleted successfully',
      responseData: body,
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    if (err.name === 'ConditionalCheckFailedException') {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Book not found',
        responseData: body,
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
