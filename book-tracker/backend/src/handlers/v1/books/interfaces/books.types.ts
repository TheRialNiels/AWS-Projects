import {
  InferSchema,
  createSchema,
  enumField,
  numberField,
  preprocessNumber,
  queryParamRecordField,
  stringField,
  uuidField,
} from '@lib/packages/zod'

import { AttributeValue } from '@aws-sdk/client-dynamodb'

export const BookIdSchema = uuidField('Book ID').optional()
export const BookTitleSchema = stringField('Title', 3, 60)
export const BookAuthorSchema = stringField('Author', 3, 60)
const bookStatus = ['READING', 'COMPLETED', 'WISHLIST', 'ABANDONED']
export const BookStatusSchema = enumField('Status', bookStatus)
export const BookRatingSchema = numberField('Rating', 1, 5).optional()
export const BookNotesSchema = stringField('Notes', 3, 500).optional()

export const BookSchema = createSchema({
  id: () => BookIdSchema,
  title: () => BookTitleSchema,
  author: () => BookAuthorSchema,
  status: () => BookStatusSchema,
  rating: () => BookRatingSchema,
  notes: () => BookNotesSchema,
})

export type Book = InferSchema<typeof BookSchema>

export interface BooksCreateItemParams {
  item: Record<string, any>
  conditionExpression?: string
}

export interface BooksQueryTitleGsiParams {
  title: string
  author?: string
  limit?: number
  lastEvaluatedKey?: Record<string, AttributeValue>
}

export interface BooksQueryTitleGsiResult {
  items: Record<string, AttributeValue>[]
  lastEvaluatedKey?: Record<string, AttributeValue>
}

export const BooksScanPageParamsSchema = createSchema({
  limit: () => preprocessNumber().optional(),
  lastEvaluatedKey: () => queryParamRecordField().optional(),
})

export interface BooksScanPageParams {
  limit?: number
  lastEvaluatedKey?: Record<string, AttributeValue>
}

export interface BooksScanPageResult {
  items: Record<string, AttributeValue>[]
  lastEvaluatedKey?: Record<string, AttributeValue>
}
