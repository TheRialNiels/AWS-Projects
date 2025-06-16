import {
  BookSchema,
  type Book,
  type BooksQueryTitleGsiParams,
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
import { isString } from '@lib/utils'

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
  const methods = ['PATCH', 'OPTIONS']
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

    // * Get the body payload and id param from request
    const body: Book = JSON.parse(event.body || '{}')
    body.id = event.pathParameters?.id || ''

    // * Trim whitespace
    isString(body.title) ? (body.title = body.title.trim()) : null
    isString(body.author) ? (body.author = body.author.trim()) : null
    body.notes && isString(body.notes) ? (body.notes = body.notes.trim()) : null

    // * Validate payload with schema
    const schemaValidation = BookSchema.safeParse(body)
    if (schemaValidation.error) {
      const error = returnFlattenError(schemaValidation.error)
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'Invalid request payload',
        responseData: { message: error },
      })
    }

    // * Get original item
    const key = { id: { S: body.id } }
    const originalItem = await dynamoDBClient.getItem(key)

    // * Validate if the title or author was changed
    const titleChanged = originalItem?.title?.S !== body.title
    const authorChanged = originalItem?.author?.S !== body.author

    if (titleChanged || authorChanged) {
      // * Validate if the book already exists
      const query: BooksQueryTitleGsiParams = {
        title: body.title,
        author: body.author,
      }
      const result = await dynamoDBClient.queryTitleGsi(query)
      const isAnotherItem = result.items?.some((item) => item.id?.S !== body.id)

      if (isAnotherItem) {
        // * Return an error if the item already exists
        return errorResponse({
          statusCode: BAD_REQUEST,
          additionalHeaders: createCORSHeaders(origin, [], methods),
          message: 'Book already exists',
          responseData: {
            message: `A book with title "${body.title}" by "${body.author}" already exists`,
          },
        })
      }
    }

    // * Prepare the item to be updated in DynamoDB
    const {
      expressionAttributeNames,
      expressionAttributeValues,
      updateExpression,
    } = BooksDynamoDBClient.buildUpdateExpression({
      title: body.title,
      author: body.author,
      status: body.status,
      rating: body.rating,
      notes: body.notes,
    })

    // * Update item in DynamoDB
    await dynamoDBClient.updateItem({
      key,
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues,
    })

    // * Return success response
    return successResponse({
      statusCode: OK,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Book updated successfully',
      responseData: body,
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    return errorResponse({
      statusCode: err.$metadata
        ? err.$metadata.httpStatusCode
        : INTERNAL_SERVER_ERROR,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Error updating the book',
      responseData: { message: 'Unexpected error' },
    })
  }
}
