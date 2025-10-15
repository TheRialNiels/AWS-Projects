import { type BooksQueryUserBookKeyGsiParams } from '@interfaces/books.types'
import { BooksDynamoDBClient } from '@lib/booksDynamoDBClient'
import { env } from '@lib/packages/env'
import { chunkArray } from '@lib/utils'

interface ValidatedBook {
  userId: string
  bookId: string
  bookKey: string
  title: string
  author: string
  status: string
  rating: number
  notes: string
  createdAt: string
  updatedAt: string
}

interface InsertResult {
  successCount: number
  duplicateCount: number
  errorCount: number
}

const booksDBClient = new BooksDynamoDBClient({
  region: env.REGION,
  tableName: env.BOOKS_TABLE,
  userBookKeyGsi: env.BOOKS_USER_BOOK_KEY_GSI,
})

export const handler = async (event: { validBooks: ValidatedBook[] }): Promise<InsertResult> => {
  let successCount = 0
  let duplicateCount = 0
  let errorCount = 0

  const booksToInsert = []

  // Check for duplicates
  for (const book of event.validBooks) {
    const query: BooksQueryUserBookKeyGsiParams = {
      userId: book.userId,
      bookKey: book.bookKey,
    }
    
    const existingBook = await booksDBClient.queryUserBookKeyGsi(query)
    if (existingBook.items.length > 0) {
      duplicateCount++
      continue
    }

    booksToInsert.push({
      PutRequest: {
        Item: {
          userId: { S: book.userId },
          bookId: { S: book.bookId },
          bookKey: { S: book.bookKey },
          title: { S: book.title },
          author: { S: book.author },
          status: { S: book.status },
          rating: { N: String(book.rating) },
          notes: { S: book.notes },
          createdAt: { S: book.createdAt },
          updatedAt: { S: book.updatedAt },
        },
      },
    })
  }

  // Insert in chunks of 25
  const chunks = chunkArray(booksToInsert, 25)
  for (const chunk of chunks) {
    try {
      await booksDBClient.batchWrite(chunk)
      successCount += chunk.length
    } catch (error) {
      console.error('Batch write error:', error)
      errorCount += chunk.length
    }
  }

  return { successCount, duplicateCount, errorCount }
}