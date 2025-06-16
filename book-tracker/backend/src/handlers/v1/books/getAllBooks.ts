import {
  BooksScanPageParamsSchema,
  type Book,
  type BooksScanPageParams,
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
import { returnFlattenError } from '@lib/packages/zod'

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

    // * Get the limit and lastEvaluatedKey from query string params
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit)
      : 10 // * Default limit
    const lastEvaluatedKeyParam =
      event.queryStringParameters?.lastEvaluatedKey || null

    // * Validate query string params with schema
    const queriesSchemaValidation = BooksScanPageParamsSchema.safeParse({
      limit,
      lastEvaluatedKey: lastEvaluatedKeyParam ?? undefined,
    })
    if (queriesSchemaValidation.error) {
      const error = returnFlattenError(queriesSchemaValidation.error)
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Invalid query parameters',
        responseData: { message: error },
      })
    }

    // * Prepare the params to get the items from DynamoDB
    const params = queriesSchemaValidation.data

    // * Scan items in DynamoDB
    const { items, lastEvaluatedKey } = await dynamoDBClient.scanPage(
      params as BooksScanPageParams,
    )

    // * Validate if the items were returned
    if (!items) {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Books not found',
      })
    }

    // * Return success response
    const books: Book[] = items.map((item) => ({
      id: item.id.S!,
      title: item.title.S!,
      author: item.author.S!,
      status: item.status.S!,
      rating: item.rating?.N !== undefined ? +item.rating.N : undefined,
      notes: item.notes?.S ?? undefined,
    }))
    return successResponse({
      statusCode: OK,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Success',
      responseData: { books, lastEvaluatedKey },
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    return errorResponse({
      statusCode: err.$metadata
        ? err.$metadata.httpStatusCode
        : INTERNAL_SERVER_ERROR,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Error retrieving books',
      responseData: { message: 'Unexpected error' },
    })
  }
}
