import { AttributeValue, ReturnValue } from '@aws-sdk/client-dynamodb'
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
export type Item = Record<string, AttributeValue>

export interface BooksCreateItemParams {
  item: Record<string, any>
  conditionExpression?: string
}

export interface UpdateItemParams {
  key: Item
  updateExpression: string
  expressionAttributeNames: Record<string, string>
  expressionAttributeValues: Item
  conditionExpression?: string
  returnValues?: ReturnValue
}

export interface BooksQueryTitleGsiParams {
  title: string
  author?: string
  limit?: number
  lastEvaluatedKey?: Item
}

export interface BooksQueryTitleGsiResult {
  items: Item[]
  lastEvaluatedKey?: Record<string, AttributeValue>
}

export const BooksScanPageParamsSchema = createSchema({
  limit: () => preprocessNumber().optional(),
  lastEvaluatedKey: () => queryParamRecordField().optional(),
})

export interface BooksScanPageParams {
  limit?: number
  lastEvaluatedKey?: Item
}

export interface BooksScanPageResult {
  items: Item[]
  lastEvaluatedKey?: Item
}
