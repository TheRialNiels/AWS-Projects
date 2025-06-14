import { z } from 'zod'

export const categoryIdSchema = z.string().uuid()

export const categorySchema = z.object({
    id: categoryIdSchema,
    label: z.string().min(3),
})

export interface categoryObj {
    id: string
    name: string
    label: string
}

export interface CategoriesDynamoDBConfig {
    region: string
    tableName: string
    gsiName?: string // * Optional GSI for queries by alternate keys
}
