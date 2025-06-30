import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
  BookSchema,
  type Book,
  type BooksQueryUserBookKeyGsiParams,
} from '@interfaces/books.types'
import { BooksDynamoDBClient } from '@lib/booksDynamoDBClient'
import { env } from '@lib/packages/env'
import { generateUuid } from '@lib/packages/uuid'
import { returnFlattenError, validateSchema } from '@lib/packages/zod'
import { UploadsFilesDynamoDBClient } from '@lib/uploadsFilesDynamoDBClient'
import { chunkArray } from '@lib/utils'
import { EventBridgeEvent } from 'aws-lambda'

const s3Client = new S3Client({ region: env.REGION })
const booksDbConfig = {
  region: env.REGION,
  tableName: env.BOOKS_TABLE,
  userBookKeyGsi: env.BOOKS_USER_BOOK_KEY_GSI,
}
const uploadsDbConfig = {
  region: env.REGION,
  tableName: env.BOOKS_FILES_UPLOADS_TABLE,
}
const booksDBClient = new BooksDynamoDBClient(booksDbConfig)
const uploadsDBClient = new UploadsFilesDynamoDBClient(uploadsDbConfig)

interface ProcessingError {
  row: number
  field: string
  message: string
}

interface S3EventDetail {
  bucket: {
    name: string
  }
  object: {
    key: string
  }
}

export const handler = async (
  event: EventBridgeEvent<'Object Created', S3EventDetail>,
): Promise<void> => {
  console.log('EventBridge Event received:', JSON.stringify(event, null, 2))

  // * Extract S3 bucket and key from EventBridge event
  const bucket = event.detail.bucket.name
  const key = decodeURIComponent(event.detail.object.key.replace(/\+/g, ' '))

  console.log(`Processing file: ${key} from bucket: ${bucket}`)

  try {
    // * Extract updateId and userId from S3 key format: uploads/{userId}/{updateId}.csv
    const keyParts = key.split('/')
    if (keyParts.length !== 3 || keyParts[0] !== 'uploads') {
      console.error('Invalid S3 key format:', key)
      throw new Error('Invalid S3 key format')
    }

    const userId = keyParts[1]
    const updateId = keyParts[2].replace('.csv', '')

    // * Download CSV file from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
    const response = await s3Client.send(getObjectCommand)
    const csvContent = await response.Body?.transformToString()

    // * Validate CSV content is not empty
    if (!csvContent || !csvContent.trim()) {
      throw new Error('Empty CSV file')
    }

    // * Parse CSV into lines
    const lines = csvContent.trim().split('\n')

    // * Validate CSV has at least header + one data row
    if (lines.length < 2) {
      await uploadsDBClient.updateItem({
        updateId,
        userId,
        updateData: {
          stage: 'failed',
          totalRows: 0,
          processedRows: 0,
          successCount: 0,
          errorCount: 1,
          errors: [
            {
              row: 1,
              field: 'csv',
              message: 'CSV file must have at least one data row.',
            },
          ],
        },
      })
      throw new Error('CSV must contain at least one data row')
    }

    // * Extract and validate CSV headers
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const expectedHeaders = ['title', 'author', 'status', 'rating', 'notes']
    const hasValidHeaders = expectedHeaders.every((header) =>
      headers.includes(header),
    )

    // * Stop processing if headers are invalid
    if (!hasValidHeaders) {
      await uploadsDBClient.updateItem({
        updateId,
        userId,
        updateData: {
          stage: 'failed',
          totalRows: lines.length - 1,
          processedRows: 0,
          successCount: 0,
          errorCount: 1,
          errors: [
            {
              row: 0,
              field: 'headers',
              message: `Invalid headers. Expected: ${expectedHeaders.join(
                ', ',
              )}`,
            },
          ],
        },
      })
      throw new Error('Invalid CSV headers')
    }

    // * Initialize processing variables
    const dataRows = lines.slice(1)
    const totalRows = dataRows.length
    const errors: ProcessingError[] = []
    let successCount = 0
    let processedRows = 0
    const booksToInsert: { request: any; rowNumber: number }[] = []

    // * Process each data row
    for (const [index, row] of dataRows.entries()) {
      const rowNumber = index + 2 // * +2 because we skip header and arrays are 0-indexed
      const values = row.split(',').map((v) => v.trim())
      processedRows++

      // * Parse rating value safely
      const now = new Date().toISOString()
      const ratingRaw = values[headers.indexOf('rating')]
      const rating = ratingRaw && !isNaN(+ratingRaw) ? +ratingRaw : 0

      // * Create book object from CSV row
      const book: Book = {
        userId,
        bookId: generateUuid(),
        title: values[headers.indexOf('title')] || '',
        author: values[headers.indexOf('author')] || '',
        status: values[headers.indexOf('status')] || '',
        rating,
        notes: values[headers.indexOf('notes')] || '',
        createdAt: now,
        updatedAt: now,
      }

      // * Validate book data against schema
      const validation = validateSchema(BookSchema, book)
      if (validation.error) {
        const error = returnFlattenError(validation.error)
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          errors.push({
            row: rowNumber,
            field,
            message: (messages as string[])[0] || 'Validation error',
          })
        }
        continue // * Skip invalid rows
      }

      // * Check for duplicate books using bookKey (title + author)
      const bookKey = `${book.title.toLowerCase()}#${book.author.toLowerCase()}`
      const query: BooksQueryUserBookKeyGsiParams = {
        userId: book.userId,
        bookKey,
      }
      const existingBook = await booksDBClient.queryUserBookKeyGsi(query)

      if (existingBook.items.length > 0) {
        console.log(
          `Book already exists for user ${book.userId} with key ${bookKey}`,
        )
        continue // * Skip duplicates without adding to errors
      }

      // * Add valid book to batch insert array
      booksToInsert.push({
        request: {
          PutRequest: {
            Item: {
              userId: { S: book.userId },
              bookId: { S: book.bookId! },
              bookKey: { S: bookKey },
              title: { S: book.title },
              author: { S: book.author },
              status: { S: book.status },
              rating: { N: String(book.rating || 0) },
              notes: { S: book.notes || '' },
              createdAt: { S: now },
              updatedAt: { S: now },
            },
          },
        },
        rowNumber,
      })
    }

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
            row: b.rowNumber,
            field: 'system',
            message: 'Failed to save to database',
          })
        }
      }
    }

    // * Update final processing status in uploads table
    await uploadsDBClient.updateItem({
      updateId,
      userId,
      updateData: {
        stage: 'completed',
        totalRows,
        processedRows,
        successCount,
        errorCount: errors.length,
        errors,
      },
    })

    console.log(
      `Successfully processed ${successCount} books from ${totalRows} rows`,
    )
  } catch (error) {
    console.error('Error processing CSV file:', error)

    // * Attempt to update status to failed if we can extract IDs from S3 key
    try {
      const keyParts = key.split('/')
      if (keyParts.length === 3 && keyParts[0] === 'uploads') {
        const userId = keyParts[1]
        const updateId = keyParts[2].replace('.csv', '')

        await uploadsDBClient.updateItem({
          updateId,
          userId,
          updateData: {
            stage: 'failed',
            totalRows: 0,
            processedRows: 0,
            successCount: 0,
            errorCount: 1,
            errors: [
              {
                row: 0,
                field: 'system',
                message:
                  error instanceof Error ? error.message : 'Unknown error',
              },
            ],
          },
        })
      }
    } catch (updateError) {
      console.error('Error updating status to failed:', updateError)
    }
  }
}
