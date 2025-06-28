import { InferSchema, createSchema } from '@lib/packages/zod'

import { BookUserIdSchema } from '@interfaces/books.types'

export const GeneratePresignedUrlSchema = createSchema({
  userId: () => BookUserIdSchema,
})

export type GeneratePresignedUrlRequest = InferSchema<
  typeof GeneratePresignedUrlSchema
>

export interface UploadsFilesCreateItemParams {
  item: Record<string, any>
}

export interface FileUploadRecord {
  updateId: string
  userId: string
  stage: string
  totalRows: number
  processedRows: number
  successCount: number
  errorCount: number
  errors: string[]
}
