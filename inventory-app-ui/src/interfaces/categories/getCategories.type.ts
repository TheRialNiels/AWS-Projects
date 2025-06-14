import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, {
    message: 'Category name must be at least 3 characters',
  }).optional(),
  label: z.string().min(3, {
    message: 'Category name must be at least 3 characters',
  }),
})

export interface GetCategoriesResponse {
  message: string
  responseData: ResponseData
  success: boolean
}

interface ResponseData {
  categories: Category[]
}

export type Category = z.infer<typeof categorySchema>
