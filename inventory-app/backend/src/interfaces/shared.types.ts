import type { AttributeValue } from '@aws-sdk/client-dynamodb'

export interface BodyOptions {
    statusCode: number
    message?: string | Record<string, any>
    responseData?: Record<string, any>
    success?: boolean
    additionalHeaders?: Record<string, string>
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
    keyConditionExpression?: string
    expressionAttributeNames?: Record<string, string>
    expressionAttributeValues?: Record<string, any>
}

export interface scanPageParams {
    limit: number
    lastEvaluatedKey?: Record<string, AttributeValue>
}

export interface scanPageResponse {
    items: Record<string, AttributeValue>[]
    lastKey?: Record<string, AttributeValue>
}
