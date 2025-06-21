import { BookIdSchema, type Book, type Item } from '@interfaces/books.types'
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
}
const dynamoDBClient = new BooksDynamoDBClient(dynamoDbConfig)

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const origin = getOriginFromEvent(event)
  const methods = ['GET', 'OPTIONS']
  const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatusCodes

  try {
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

    // * Prepare the key to get the item from DynamoDB
    const key = {
      id: { S: id },
    }

    // * Get item from DynamoDB
    const { Item: item } = await dynamoDBClient.getItem(key as Item)

    // * Validate if the item was returned
    if (!item) {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Book not found',
      })
    }

    // * Return success response
    const book: Book = {
      id: item.id.S,
      title: item.title.S,
      author: item.author.S,
      status: item.status.S,
      rating: item.rating?.N !== undefined ? +item.rating.N : undefined,
      notes: item.notes?.S,
      createdAt: item.createdAt?.S,
      updatedAt: item.updatedAt?.S,
    }
    return successResponse({
      statusCode: OK,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Success',
      responseData: { book },
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    return errorResponse({
      statusCode: err.$metadata
        ? err.$metadata.httpStatusCode
        : INTERNAL_SERVER_ERROR,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Error retrieving book',
      responseData: { message: 'Unexpected error' },
    })
  }
}
