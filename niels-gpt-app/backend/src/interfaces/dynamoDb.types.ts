import type { AttributeValue, ReturnValue } from '@aws-sdk/client-dynamodb'

export interface DynamoDbConfig {
  region: string
  table: string
}

export type Item = Record<string, AttributeValue> | undefined

export interface UpdateCommandParams {
  key: Item
  updateExpression: string
  expressionAttributeNames: Record<string, string>
  expressionAttributeValues: Item
  conditionExpression?: string
  returnValues?: ReturnValue
}
