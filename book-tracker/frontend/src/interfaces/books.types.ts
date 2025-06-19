import {
  type InferSchema,
  createSchema,
  enumField,
  numberField,
  stringField,
  uuidField,
} from '@/lib/zod'

export const BookIdSchema = uuidField('Book ID')
export const BookTitleSchema = stringField('Title', 3, 60)
export const BookAuthorSchema = stringField('Author', 3, 60)
const bookStatus = ['READING', 'COMPLETED', 'WISHLIST', 'ABANDONED']
export const BookStatusSchema = enumField('Status', bookStatus)
export const BookRatingSchema = numberField('Rating', 0, 5)
export const BookNotesSchema = stringField('Notes', 3, 500)

export const BookSchema = createSchema({
  id: () => BookIdSchema.optional(),
  title: () => BookTitleSchema,
  author: () => BookAuthorSchema,
  status: () => BookStatusSchema,
  rating: () => BookRatingSchema.optional(),
  notes: () => BookNotesSchema.optional(),
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
}
