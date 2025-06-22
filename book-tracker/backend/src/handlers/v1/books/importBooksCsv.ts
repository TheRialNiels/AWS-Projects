import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Book, BooksImportSchema } from '@interfaces/books.types'
import {
  createCORSHeaders,
  createPreflightResponse,
  getOriginFromEvent,
} from '@lib/cors'
import {
  errorResponse,
  httpStatusCodes,
  normalizeHeaders,
  successResponse,
} from '@lib/httpResponse'
import { isNumber, isString } from '@lib/utils'
import { returnFlattenError, validateSchema } from '@lib/packages/zod'

import { BooksDynamoDBClient } from '@lib/booksDynamoDBClient'
import { env } from '@lib/packages/env'
import { generateUuid } from '@lib/packages/uuid'
import { parse } from 'csv-parse/sync'

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
  const methods = ['POST', 'OPTIONS']
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

    // * Check if the request body is a valid CSV file
    const headers = normalizeHeaders(event.headers)
    const contentType = headers['content-type'] || ''
    if (!event.body || !contentType.includes('text/csv')) {
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'CSV file is required',
      })
    }

    // * Parse the CSV content
    const csv = Buffer.from(
      event.body,
      event.isBase64Encoded ? 'base64' : 'utf8',
    ).toString('utf8')

    // * Parse CSV to JSON
    let rawBooks: Book[] = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // * Normalize and clean the book data
    const now = new Date().toISOString()
    rawBooks = rawBooks.map((book) => ({
      id: book.id || generateUuid(),
      title: book.title && isString(book.title) ? book.title.trim() : null,
      author: book.author && isString(book.author) ? book.author.trim() : null,
      status: book.status && isString(book.status) ? book.status : undefined,
      rating: book.rating && isNumber(book.rating) ? book.rating : null,
      notes: book.notes && isString(book.notes) ? book.notes.trim() : null,
      createdAt: book.createdAt || now,
      updatedAt: book.updatedAt || now,
    }))

    // * Validate csv items with schema
    const schemaValidation = validateSchema(BooksImportSchema, rawBooks)
    if (schemaValidation.error) {
      const errors = returnFlattenError(schemaValidation.error)
      return errorResponse({
        statusCode: BAD_REQUEST,
        additionalHeaders: createCORSHeaders(origin, [], methods),
        message: 'CSV contains invalid records',
        responseData: { message: errors },
      })
    }

    // * DynamoDB supports max 25 items per batchWrite
    const chunks = chunkArray(rawBooks, 25)

    for (const chunk of chunks) {
      const requestItems = chunk.map((book) => ({
        PutRequest: {
          Item: {
            id: { S: book.id! },
            title: { S: book.title! },
            author: { S: book.author! },
            status: { S: String(book.status) },
            createdAt: { S: book.createdAt! },
            updatedAt: { S: book.updatedAt! },
            ...(book.rating != null
              ? { rating: { N: String(book.rating) } }
              : {}),
            ...(book.notes != null ? { notes: { S: book.notes } } : {}),
          },
        },
      }))

      await dynamoDBClient.batchWrite(requestItems)
    }

    return successResponse({
      statusCode: OK,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Books imported successfully',
      responseData: { count: schemaValidation.data.length },
    })
  } catch (err: any) {
    console.log(err) // TODO - Implement CW to log the error
    return errorResponse({
      statusCode: err.$metadata?.httpStatusCode || INTERNAL_SERVER_ERROR,
      additionalHeaders: createCORSHeaders(origin, [], methods),
      message: 'Error importing books from CSV',
      responseData: { message: 'Unexpected error' },
    })
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  )
}
