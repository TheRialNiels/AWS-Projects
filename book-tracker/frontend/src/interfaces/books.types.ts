import {
  type InferSchema,
  createSchema,
  enumField,
  numberField,
  stringField,
  uuidField,
} from '@/lib/zod'

export const BookUserIdSchema = stringField('User ID', {
  regex: /^[0-9a-fA-F-]{36}$/,
})
export const BookIdSchema = uuidField('Book ID', { optional: true })
export const BookTitleSchema = stringField('Title', {
  minLength: 3,
  maxLength: 60,
})
export const BookAuthorSchema = stringField('Author', {
  minLength: 3,
  maxLength: 60,
})
const bookStatus: [string, ...string[]] = [
  'READING',
  'COMPLETED',
  'WISHLIST',
  'ABANDONED',
]
export const BookStatusSchema = enumField('Status', bookStatus)
export const BookRatingSchema = numberField('Rating', {
  minLength: 0,
  maxLength: 5,
  optional: true,
})
export const BookNotesSchema = stringField('Notes', {
  maxLength: 500,
  optional: true,
})

export const BookSchema = createSchema({
  userId: () => BookUserIdSchema,
  bookId: () => BookIdSchema,
  title: () => BookTitleSchema,
  author: () => BookAuthorSchema,
  status: () => BookStatusSchema,
  rating: () => BookRatingSchema,
  notes: () => BookNotesSchema,
})

export type Book = InferSchema<typeof BookSchema>
export type BookId = InferSchema<typeof BookIdSchema>
export type BookTitle = InferSchema<typeof BookTitleSchema>
export type BookAuthor = InferSchema<typeof BookAuthorSchema>
export type BookStatus = InferSchema<typeof BookStatusSchema>
export type BookRating = InferSchema<typeof BookRatingSchema>
export type BookNotes = InferSchema<typeof BookNotesSchema>

export interface CreateBookResponse {
  message: string
  responseData: Book
  success: boolean
}

export interface GetBooksResponse {
  message: string
  responseData: GetBooksResponseData
  success: boolean
}

interface GetBooksResponseData {
  books: Book[]
  lastEvaluatedKey: LastEvaluatedKey
}

interface LastEvaluatedKey {
  id: { S: string }
}

export interface PatchBookResponse {
  message: string
  responseData: Book
  success: boolean
}

export interface DeleteBookResponse {
  message: string
  responseData: Book
  success: boolean
}

export interface ImportBooksResponse {
  message: string
  responseData: ImportBooksResponseData
  success: boolean
}

export interface ImportBooksResponseData {
  count: number
}
