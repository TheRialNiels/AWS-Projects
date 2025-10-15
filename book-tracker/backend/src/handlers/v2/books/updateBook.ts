import {
  BookSchema,
  type Book,
  type BooksQueryUserBookKeyGsiParams,
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
import { isString } from '@lib/utils'

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
    body.updatedAt = new Date().toISOString()

    // * Validate payload with schema
    const schemaValidation = validateSchema(BookSchema, body)
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
    const key = {
      userId: { S: body.userId },
      bookId: { S: body.bookId }
    }
    const { Item: originalItem } = await dynamoDBClient.getItem(key)

    // * Validate if the title or author was changed
    const titleChanged = originalItem?.title?.S !== body.title
    const authorChanged = originalItem?.author?.S !== body.author
    let newBookKey: string | undefined

    if (titleChanged || authorChanged) {
      newBookKey = `${body.title!.toLowerCase()}#${body.author!.toLowerCase()}`

      // * Validate if the book already exists
      const query: BooksQueryUserBookKeyGsiParams = {
        userId: body.userId,
        bookKey: newBookKey,
      }
      const result = await dynamoDBClient.queryUserBookKeyGsi(query)
      const isAnotherItem = result.items?.some((item) => item.bookId?.S !== body.bookId)

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
    const updateData: Record<string, any> = {
      title: body.title,
      author: body.author,
      status: body.status,
      rating: body.rating,
      notes: body.notes,
      updatedAt: body.updatedAt,
    }

    // * Add bookKey if title or author changed
    if (newBookKey) {
      updateData.bookKey = newBookKey
    }

    const {
      expressionAttributeNames,
      expressionAttributeValues,
      updateExpression,
    } = BooksDynamoDBClient.buildUpdateExpression(updateData)

    // * Update item in DynamoDB
    const result = await dynamoDBClient.updateItem({
      key,
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues,
    })

    // * Return success response
    body.createdAt = result?.Attributes?.createdAt.S!
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
