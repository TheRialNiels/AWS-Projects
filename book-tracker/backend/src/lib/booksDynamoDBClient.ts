import type {
  BooksCreateItemParams,
  BooksQueryTitleGsiParams,
  BooksQueryTitleGsiResult,
  BooksScanPageParams,
  BooksScanPageResult,
  DeleteItemParams,
  Item,
  UpdateItemParams,
} from '@interfaces/books.types'
import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  ReturnValue,
  ScanCommand,
  ScanCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb'

export class BooksDynamoDBClient {
  private client: DynamoDBClient
  private tableName: string
  private titleGsi: string
  private authorGsi: string

  constructor(config: any) {
    this.client = new DynamoDBClient({ region: config.region })
    this.tableName = config.tableName
    this.titleGsi = config.titleGsi
    this.authorGsi = config.authorGsi
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

  async createItem(params: BooksCreateItemParams): Promise<Item | null> {
    const input: PutItemCommandInput = {
      TableName: this.tableName,
      Item: params.item,
      ConditionExpression:
        params.conditionExpression ?? 'attribute_not_exists(id)',
    }

    try {
      const result = await this.client.send(new PutItemCommand(input))
      return result.Attributes || null
    } catch (err) {
      throw err
    }
  }

  async getItem(key: Item): Promise<Item | null> {
    const input: GetItemCommandInput = {
      TableName: this.tableName,
      Key: key,
    }

    try {
      const result = await this.client.send(new GetItemCommand(input))
      return result.Item || null
    } catch (err) {
      throw err
    }
  }

  async updateItem(params: UpdateItemParams): Promise<Item | null> {
    const input: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: params.key,
      UpdateExpression: params.updateExpression,
      ExpressionAttributeNames: params.expressionAttributeNames,
      ExpressionAttributeValues: params.expressionAttributeValues,
      ConditionExpression: params.conditionExpression ?? 'attribute_exists(id)',
      ReturnValues: (params.returnValues as ReturnValue) || 'ALL_NEW',
    }

    try {
      const result = await this.client.send(new UpdateItemCommand(input))
      return result.Attributes || null
    } catch (err) {
      throw err
    }
  }

  async deleteItem(params: DeleteItemParams): Promise<Item | null> {
    const input: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: params.key,
      ConditionExpression: params.conditionExpression ?? 'attribute_exists(id)',
    }

    try {
      const result = await this.client.send(new DeleteItemCommand(input))
      return result.Attributes || null
    } catch (err) {
      throw err
    }
  }

  async queryTitleGsi(
    params: BooksQueryTitleGsiParams,
  ): Promise<BooksQueryTitleGsiResult> {
    const input: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: this.titleGsi,
      KeyConditionExpression: params.author
        ? '#title = :title AND #author = :author'
        : '#title = :title',
      ExpressionAttributeNames: {
        '#title': 'title',
        ...(params.author && { '#author': 'author' }),
      },
      ExpressionAttributeValues: {
        ':title': { S: params.title },
        ...(params.author && { ':author': { S: params.author } }),
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
      return {
        items: result.Items ?? [],
        lastEvaluatedKey: result.LastEvaluatedKey,
      }
    } catch (err) {
      throw err
    }
  }
}
