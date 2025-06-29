import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb'

import type { UploadsFilesCreateItemParams } from '@interfaces/books-uploads.types'

export class UploadsFilesDynamoDBClient {
  private client: DynamoDBClient
  private tableName: string

  constructor(config: { region: string; tableName: string }) {
    this.client = new DynamoDBClient({ region: config.region })
    this.tableName = config.tableName
  }

  async createItem(
    params: UploadsFilesCreateItemParams,
  ): Promise<PutItemCommandOutput> {
    const input: PutItemCommandInput = {
      TableName: this.tableName,
      Item: params.item,
    }

    try {
      const result = await this.client.send(new PutItemCommand(input))
      return result
    } catch (err) {
      throw err
    }
  }

  async getItem(
    updateId: string,
    userId: string,
  ): Promise<GetItemCommandOutput> {
    const input: GetItemCommandInput = {
      TableName: this.tableName,
      Key: {
        updateId: { S: updateId },
        userId: { S: userId },
      },
    }

    try {
      const result = await this.client.send(new GetItemCommand(input))
      return result
    } catch (err) {
      throw err
    }
  }

  static buildUpdateExpression(data: Record<string, any>) {
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, any> = {}
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
      } else if (Array.isArray(value)) {
        expressionAttributeValues[attributeValue] = {
          L: value.map((item) => ({ S: JSON.stringify(item) })),
        }
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

  async updateItem(params: {
    updateId: string
    userId: string
    updateData: Record<string, any>
  }): Promise<UpdateItemCommandOutput> {
    const {
      expressionAttributeNames,
      expressionAttributeValues,
      updateExpression,
    } = UploadsFilesDynamoDBClient.buildUpdateExpression(params.updateData)

    const input: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: {
        updateId: { S: params.updateId },
        userId: { S: params.userId },
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    }

    try {
      const result = await this.client.send(new UpdateItemCommand(input))
      return result
    } catch (err) {
      throw err
    }
  }
}
