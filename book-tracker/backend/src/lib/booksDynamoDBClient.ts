import {
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  QueryCommand,
  QueryCommandInput,
  ReturnValue,
  ScanCommand,
  ScanCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb'
import type {
  BooksCreateItemParams,
  BooksQueryResult,
  BooksQueryUserBookKeyGsiParams,
  BooksScanPageParams,
  BooksScanPageResult,
  DeleteItemParams,
  Item,
  UpdateItemParams,
} from '@interfaces/books.types'

export class BooksDynamoDBClient {
  private client: DynamoDBClient
  private tableName: string
  private userBookKeyGsi: string

  constructor(config: {
    region: string
    tableName: string
    userBookKeyGsi: string
  }) {
    this.client = new DynamoDBClient({ region: config.region })
    this.tableName = config.tableName
    this.userBookKeyGsi = config.userBookKeyGsi
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

  async createItem(
    params: BooksCreateItemParams,
  ): Promise<PutItemCommandOutput> {
    const input: PutItemCommandInput = {
      TableName: this.tableName,
      Item: params.item,
      ConditionExpression:
        params.conditionExpression ?? 'attribute_not_exists(userId) AND attribute_not_exists(bookId)',
    }

    try {
      const result = await this.client.send(new PutItemCommand(input))
      return result
    } catch (err) {
      throw err
    }
  }

  async getItem(key: Item): Promise<GetItemCommandOutput> {
    const input: GetItemCommandInput = {
      TableName: this.tableName,
      Key: key,
    }

    try {
      const result = await this.client.send(new GetItemCommand(input))
      return result
    } catch (err) {
      throw err
    }
  }

  async updateItem(params: UpdateItemParams): Promise<UpdateItemCommandOutput> {
    const input: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: params.key,
      UpdateExpression: params.updateExpression,
      ExpressionAttributeNames: params.expressionAttributeNames,
      ExpressionAttributeValues: params.expressionAttributeValues,
      ConditionExpression: params.conditionExpression ?? 'attribute_exists(userId) AND attribute_exists(bookId)',
      ReturnValues: (params.returnValues as ReturnValue) || 'ALL_NEW',
    }

    try {
      const result = await this.client.send(new UpdateItemCommand(input))
      return result
    } catch (err) {
      throw err
    }
  }

  async batchWrite(
    requestItems: { PutRequest: { Item: Item } }[],
  ): Promise<BatchWriteItemCommandOutput> {
    const input: BatchWriteItemCommandInput = {
      RequestItems: {
        [this.tableName]: requestItems,
      },
    }

    try {
      const result = await this.client.send(new BatchWriteItemCommand(input))
      return result
    } catch (err) {
      throw err
    }
  }

  async deleteItem(params: DeleteItemParams): Promise<DeleteItemCommandOutput> {
    const input: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: params.key,
      ConditionExpression: params.conditionExpression ?? 'attribute_exists(userId) AND attribute_exists(bookId)',
    }

    try {
      const result = await this.client.send(new DeleteItemCommand(input))
      return result
    } catch (err) {
      throw err
    }
  }

  async queryUserItems(params: {
    userId: string
    limit?: number
    lastEvaluatedKey?: Item
  }): Promise<BooksQueryResult> {
    const input: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: this.userBookKeyGsi,
      KeyConditionExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId',
      },
      ExpressionAttributeValues: {
        ':userId': { S: params.userId },
      },
      Limit: params.limit,
      ExclusiveStartKey: params.lastEvaluatedKey,
    }
    try {
      const result = await this.client.send(new QueryCommand(input))
      const sortedItems = (result.Items ?? []).sort((a, b) => {
        const aTime = a.updatedAt?.S || ''
        const bTime = b.updatedAt?.S || ''
        return bTime.localeCompare(aTime)
      })
      return {
        items: sortedItems || [],
        lastEvaluatedKey: result.LastEvaluatedKey,
      }
    } catch (err) {
      throw err
    }
  }

  async queryUserBookKeyGsi(
    params: BooksQueryUserBookKeyGsiParams,
  ): Promise<BooksQueryResult> {
    const input: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: this.userBookKeyGsi,
      KeyConditionExpression: '#userId = :userId AND #bookKey = :bookKey',
      ExpressionAttributeNames: {
        '#userId': 'userId',
        '#bookKey': 'bookKey',
      },
      ExpressionAttributeValues: {
        ':userId': { S: params.userId },
        ':bookKey': { S: params.bookKey },
      },
      Limit: params.limit,
      ExclusiveStartKey: params.lastEvaluatedKey,
    }

    try {
      const result = await this.client.send(new QueryCommand(input))
      return {
        items: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey,
      }
    } catch (err) {
      throw err
    }
  }

  async scanPage(params: BooksScanPageParams): Promise<BooksScanPageResult> {
    const input: ScanCommandInput = {
      TableName: this.tableName,
      Limit: params.limit,
      ExclusiveStartKey: params.lastEvaluatedKey,
    }

    try {
      const result = await this.client.send(new ScanCommand(input))
      const sortedItems = (result.Items ?? []).sort((a, b) => {
        const aTime = a.updatedAt?.S || ''
        const bTime = b.updatedAt?.S || ''
        return bTime.localeCompare(aTime)
      })
      return {
        items: sortedItems,
        lastEvaluatedKey: result.LastEvaluatedKey,
      }
    } catch (err) {
      throw err
    }
  }
}
