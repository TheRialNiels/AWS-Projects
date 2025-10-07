import { BookSchema, type Book } from '@interfaces/books.types'
import { env } from '@lib/packages/env'
import { generateUuid } from '@lib/packages/uuid'
import { returnFlattenError, validateSchema } from '@lib/packages/zod'

interface EventData {
  Items: {
    index: number
    value: Book
    key: string
  }[]
}

interface ValidationError {
  field: string
  message: string
}

interface ValidatedBook extends Book {
  bookKey: string
}

interface ValidationResult {
  validBooks: ValidatedBook[]
  errors: ValidationError[]
}

// {
//   "Items": [
//     {
//       "index": 0,
//       "value": {
//         "authoruu": "James Clear",
//         "createdAt": "2024-06-01T10:00:00Z",
//         "ratinggg": "5",
//         "notes": "Great book on habit formation",
//         "id": "1a2b3c4d-1234-5678-9101-abcdef123456",
//         "titless": "Atomic Habits",
//         "status": "COMPLETED",
//         "updatedAt": "2024-06-01T10:00:00Z"
//       },
//       "key": "uploads/34282498-20a1-7076-2b80-abab79ac0c52/11282498-20a1-7076-2b80-abab79ac0c11.csv"
//     },
//     // ...
//   ]
// }

export const handler = async (event: EventData): Promise<void> => {
  console.log(event)

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
    throw new Error(errorMsg)
  }
}
