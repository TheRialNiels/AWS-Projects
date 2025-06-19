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
export const BookRatingSchema = numberField('Rating', 1, 5)
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
