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
  id: () => BookIdSchema,
  title: () => BookTitleSchema,
  author: () => BookAuthorSchema,
  status: () => BookStatusSchema,
  rating: () => BookRatingSchema,
  notes: () => BookNotesSchema,
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

export interface DeleteItemParams {
  key: Record<string, any>
  conditionExpression?: string
}
