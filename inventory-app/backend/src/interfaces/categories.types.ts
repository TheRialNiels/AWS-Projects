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

export interface createItemParams {
    item: Record<string, any>
    conditionExpression?: string
}

export interface updateItemParams {
    key: Record<string, any>
    updateExpression: string
    expressionAttributeNames?: Record<string, string>
    expressionAttributeValues?: Record<string, any>
    conditionExpression?: string
    returnValues?: string
}

export interface deleteItemParams {
    key: Record<string, any>
    conditionExpression?: string
}

export interface queryParams {
    keyConditionExpression: string
    expressionAttributeNames?: Record<string, string>
    expressionAttributeValues?: Record<string, any>
}
