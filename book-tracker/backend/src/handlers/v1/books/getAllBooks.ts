import {
  BooksPaginationParamsSchema,
  BooksQueryUserItemsParams,
  type Book,
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
import { returnFlattenError, validateSchema } from '@lib/packages/zod'

const dynamoDbConfig = {
  region: env.REGION,
  tableName: env.BOOKS_TABLE,
  userBookKeyGsi: env.BOOKS_USER_BOOK_KEY_GSI,
}
const dynamoDBClient = new BooksDynamoDBClient(dynamoDbConfig)

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('Event received:', JSON.stringify(event, null, 2))
  const origin = getOriginFromEvent(event)
  console.log('Origin detected:', origin)
  console.log('ALLOW_ORIGIN env:', env.ALLOW_ORIGIN)
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
        message: 'Invalid request method',
        responseData: {
          message: `Only ${methods.join(', ')} methods are allowed`,
        },
      })
    }

    // * Get query string params
    const userId = event.queryStringParameters?.userId
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit)
      : 10 // * Default limit
    const lastEvaluatedKeyParam =
      event.queryStringParameters?.lastEvaluatedKey || null

    // * Validate query string params with schema
    const queriesSchemaValidation = validateSchema(
      BooksPaginationParamsSchema,
      {
        userId,
        limit,
        lastEvaluatedKey: lastEvaluatedKeyParam ?? undefined,
      },
    )
    if (queriesSchemaValidation.error) {
      const error = returnFlattenError(queriesSchemaValidation.error)
      return errorResponse({
        statusCode: BAD_REQUEST,
        message: 'Invalid query parameters',
        responseData: { message: error },
      })
    }

    // * Prepare the params to get the items from DynamoDB
    const params = queriesSchemaValidation.data as BooksQueryUserItemsParams

    // * Query user items in DynamoDB
    const { items, lastEvaluatedKey } = await dynamoDBClient.queryUserItems(
      params,
    )

    // * Validate if the items were returned
    if (!items) {
      return errorResponse({
        statusCode: BAD_REQUEST,
        message: 'Books not found',
      })
    }

    // * Return success response
    const books: Book[] = items.map((item) => ({
      userId: item.userId.S!,
      bookId: item.bookId.S!,
      title: item.title.S!,
      author: item.author.S!,
      status: item.status.S!,
      rating: +item.rating.N!,
      notes: item.notes?.S!,
      createdAt: item.createdAt?.S!,
      updatedAt: item.updatedAt?.S!,
    }))
    return successResponse({
      statusCode: OK,
      message: 'Success',
      responseData: { books, lastEvaluatedKey },
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    return errorResponse({
      statusCode: err.$metadata
        ? err.$metadata.httpStatusCode
        : INTERNAL_SERVER_ERROR,
      message: 'Error retrieving books',
      responseData: { message: 'Unexpected error' },
    })
  }
}
