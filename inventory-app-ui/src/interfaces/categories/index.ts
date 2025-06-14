import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
})

export interface GetCategoriesResponse {
  message: string
  responseData: ResponseData
  success: boolean
}

export interface ResponseData {
  categories: Category[]
}

export type Category = z.infer<typeof categorySchema>
