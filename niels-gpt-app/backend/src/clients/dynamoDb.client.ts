import type {
  DynamoDbConfig,
  Item,
  QueryCommandParams,
  UpdateCommandParams,
} from '@/interfaces/dynamoDb.types'
import {
  BatchWriteItemCommand,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  UpdateItemCommand,
  type BatchWriteItemCommandInput,
  type BatchWriteItemCommandOutput,
  type DeleteItemCommandInput,
  type DeleteItemCommandOutput,
  type GetItemCommandInput,
  type GetItemCommandOutput,
  type PutItemCommandOutput,
  type ScanCommandInput,
  type ScanCommandOutput,
  type UpdateItemCommandInput,
  type UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb'

import { marshall } from '@aws-sdk/util-dynamodb'

export class DynamoDbClient {
  private client: DynamoDBClient
  private table: string

  constructor(config: DynamoDbConfig) {
    this.client = new DynamoDBClient({ region: config.region })
    this.table = config.table
  }

  static buildUpdateExpression(data: Record<string, any>) {
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Item = {}
    const setExpressions: string[] = []
    const removeExpressions: string[] = []

    for (const [key, value] of Object.entries(data)) {
      const attributeName = `#${key}`
      expressionAttributeNames[attributeName] = key

      if (value === undefined) {
        removeExpressions.push(attributeName)
        continue
      }

      const attributeValue = `:${key}`
      if (typeof value === 'string') {
        expressionAttributeValues[attributeValue] = { S: value }
      } else if (typeof value === 'number') {
        expressionAttributeValues[attributeValue] = { N: value.toString() }
      } else if (typeof value === 'boolean') {
        expressionAttributeValues[attributeValue] = { BOOL: value }
      }

      setExpressions.push(`${attributeName} = ${attributeValue}`)
    }

    const parts = []
    if (setExpressions.length > 0) {
      parts.push(`SET ${setExpressions.join(', ')}`)
    }
    if (removeExpressions.length > 0) {
      parts.push(`REMOVE ${removeExpressions.join(', ')}`)
    }

    return {
      updateExpression: parts.join(' '),
      expressionAttributeNames,
      expressionAttributeValues,
    }
  }

  async getCommand(item: Record<string, any>): Promise<GetItemCommandOutput> {
    const input: GetItemCommandInput = {
      TableName: this.table,
      Key: marshall(item),
    }

    try {
      return await this.client.send(new GetItemCommand(input))
    } catch (err) {
      throw err
    }
  }

  async queryCommand(params: QueryCommandParams): Promise<QueryCommandOutput> {
    const input: QueryCommandInput = {
      TableName: this.table,
      KeyConditionExpression: params.keyConditionExpression,
      ExpressionAttributeNames: params.expressionAttributeNames,
      ExpressionAttributeValues: params.expressionAttributeValues,
      IndexName: params.indexName,
      Limit: params.limit,
      ScanIndexForward: params.scanIndexForward,
    }

    try {
      return await this.client.send(new QueryCommand(input))
    } catch (err) {
      throw err
    }
  }

  async createCommand(
    item: Record<string, any>,
    conditionExpression: string,
  ): Promise<PutItemCommandOutput> {
    const params = {
      TableName: this.table,
      Item: marshall(item),
      ConditionExpression: conditionExpression,
    }

    try {
      return await this.client.send(new PutItemCommand(params))
    } catch (error) {
      throw error
    }
  }

  async updateCommand(
    params: UpdateCommandParams,
  ): Promise<UpdateItemCommandOutput> {
    const input: UpdateItemCommandInput = {
      TableName: this.table,
      Key: params.key,
      UpdateExpression: params.updateExpression,
      ExpressionAttributeNames: params.expressionAttributeNames,
      ExpressionAttributeValues: params.expressionAttributeValues,
      ConditionExpression: params.conditionExpression,
      ReturnValues: params.returnValues || 'ALL_NEW',
    }

    try {
      return await this.client.send(new UpdateItemCommand(input))
    } catch (err) {
      throw err
    }
  }

  async batchWriteCommand(
    requestItems: { PutRequest: { Item: Item } }[],
  ): Promise<BatchWriteItemCommandOutput> {
    const input: BatchWriteItemCommandInput = {
      RequestItems: {
        [this.table]: requestItems,
      },
    }

    try {
      return await this.client.send(new BatchWriteItemCommand(input))
    } catch (err) {
      throw err
    }
  }

  async batchDeleteCommand(keys: Item[]): Promise<BatchWriteItemCommandOutput> {
    const deleteRequests = keys.map((key) => ({
      DeleteRequest: { Key: key },
    }))

    const input: BatchWriteItemCommandInput = {
      RequestItems: {
        [this.table]: deleteRequests,
      },
    }

    try {
      return await this.client.send(new BatchWriteItemCommand(input))
    } catch (err) {
      throw err
    }
  }

  async deleteCommand(
    key: Record<string, any>,
    conditionExpression?: string,
  ): Promise<DeleteItemCommandOutput> {
    const input: DeleteItemCommandInput = {
      TableName: this.table,
      Key: key,
      ConditionExpression: conditionExpression,
    }

    try {
      return await this.client.send(new DeleteItemCommand(input))
    } catch (err) {
      throw err
    }
  }

  async scanCommand(
    limit: number,
    lastEvaluatedKey: Item,
  ): Promise<ScanCommandOutput> {
    const input: ScanCommandInput = {
      TableName: this.table,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }

    try {
      return await this.client.send(new ScanCommand(input))
    } catch (err) {
      throw err
    }
  }
}
