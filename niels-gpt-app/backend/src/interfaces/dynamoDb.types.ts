import type { AttributeValue, ReturnValue } from '@aws-sdk/client-dynamodb'

export interface DynamoDbConfig {
  region: string
  table: string
}

export type Item = Record<string, AttributeValue> | undefined

export interface QueryCommandParams {
  keyConditionExpression: string
  expressionAttributeNames: Record<string, string>
  expressionAttributeValues: Item
  indexName?: string
  limit?: number
  scanIndexForward?: boolean
}

export interface UpdateCommandParams {
  key: Item
  updateExpression: string
  expressionAttributeNames: Record<string, string>
  expressionAttributeValues: Item
  conditionExpression?: string
  returnValues?: ReturnValue
}
