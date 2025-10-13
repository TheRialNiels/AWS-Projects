import {
  BookSchema,
  BooksQueryUserBookKeyGsiParams,
  Item,
  type Book,
} from '@interfaces/books.types'
import { ResponseBody } from '@interfaces/shared.types'
import {
  stepFunctionErrorResponse,
  stepFunctionSuccessResponse,
} from '@lib/httpResponse'
import { generateUuid } from '@lib/packages/uuid'
import { returnFlattenError, validateSchema } from '@lib/packages/zod'
import { env } from '@lib/packages/env'
import { BooksDynamoDBClient } from '@lib/booksDynamoDBClient'
import { chunkArray } from '@lib/utils'

interface EventData {
  Items: {
    index: number
    value: Book
    key: string
  }[]
}

interface ValidationError {
  S: string
}

const booksDbConfig = {
  region: env.REGION,
  tableName: env.BOOKS_TABLE,
  userBookKeyGsi: env.BOOKS_USER_BOOK_KEY_GSI,
}

const booksDBClient = new BooksDynamoDBClient(booksDbConfig)

export const handler = async (event: EventData): Promise<ResponseBody> => {
  // * Extract key from first item in Items array
  const key: string = event.Items[0]?.key
  console.log(`Validating books from file: ${key}`)

  // * Extract updateId and userId from first item in Items array
  const keyParts = key.split('/')
  if (keyParts.length !== 3 || keyParts[0] !== 'uploads') {
    throw new Error(`Invalid S3 key format: ${key}`)
  }
  const userId = keyParts[1]
  const updateId = keyParts[2].replace('.csv', '')

  // * Validate CSV headers
  const expectedHeaders = ['title', 'author', 'status', 'rating', 'notes']
  const row = event.Items[0].value
  const headers = Object.keys(row)
  const hasValidHeaders = expectedHeaders.every((header) =>
    headers.includes(header),
  )

  // * Stop processing if headers are invalid
  if (!hasValidHeaders) {
    const errorMsg = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`

    return stepFunctionErrorResponse({
      success: false,
      responseData: {},
      error: 'Invalid Headers',
      cause: errorMsg,
    })
  }

  // * Initialize processing variables
  const dataRows = event.Items
  const errors: ValidationError[] = []
  let successCount = 0
  let processedRows = 0
  const booksToInsert: {
    request: { PutRequest: { Item: Item } }
    rowNumber: number
  }[] = []

  // * Process each data row
  dataRows.forEach(async (item) => {
    const rowNumber = item.index + 1 // * +1 because we skip header and arrays are 0-indexed
    const row = item.value
    processedRows++

    // * Parse rating value safely
    const now = new Date().toISOString()
    const rating = +row.rating

    // * Create book object from CSV row
    const book: Book = {
      userId,
      bookId: generateUuid(),
      title: row.title || '',
      author: row.author || '',
      status: row.status || '',
      rating,
      notes: row.notes || '',
      createdAt: now,
      updatedAt: now,
    }

    // * Validate book data against schema
    const validation = validateSchema(BookSchema, book)
    if (validation.error) {
      const error = returnFlattenError(validation.error)
      for (const [field, messages] of Object.entries(error.fieldErrors)) {
        errors.push({
          S: JSON.stringify({
            row: rowNumber,
            field,
            message: (messages as string[])[0] || 'Validation error',
          }),
        })
      }
      return
    }

    // * Add valid book to validBooks array
    const bookKey = `${book.title.toLowerCase()}#${book.author.toLowerCase()}`
    booksToInsert.push({
      request: {
        PutRequest: {
          Item: {
            userId: { S: book.userId },
            bookId: { S: book.bookId! },
            bookKey: { S: bookKey },
            title: { S: book.title },
            author: { S: book.author },
            status: { S: String(book.status) },
            rating: { N: String(book.rating || 0) },
            notes: { S: book.notes || '' },
            createdAt: { S: now },
            updatedAt: { S: now },
          },
        },
      },
      rowNumber,
    })
  })

  // * Process all valid books in chunks of 25 (DynamoDB batchWrite limit)
  const chunks = chunkArray(booksToInsert, 25)
  for (const chunk of chunks) {
    try {
      await booksDBClient.batchWrite(chunk.map((b) => b.request))
      successCount += chunk.length
    } catch (error) {
      console.error('Error in batch write:', error)
      // * Add failed batch items to errors
      for (const b of chunk) {
        errors.push({
          S: JSON.stringify({
            row: b.rowNumber,
            field: 'system',
            message: 'Failed to save to database',
          }),
        })
      }
    }
  }

  // * Return validation results
  console.log(
    `Successfully validated ${successCount} books from ${processedRows} rows`,
  )
  return stepFunctionSuccessResponse({
    success: true,
    responseData: {
      updateId,
      userId,
      updateData: {
        stage: 'completed',
        processedRows,
        successCount,
        errorCount: errors.length,
        errors,
      },
    },
    message: 'Books validated successfully',
  })
}
