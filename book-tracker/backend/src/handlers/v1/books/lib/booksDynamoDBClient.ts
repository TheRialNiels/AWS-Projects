import type {
  BooksCreateItemParams,
  BooksQueryTitleGsiParams,
  BooksQueryTitleGsiResult,
  BooksScanPageParams,
  BooksScanPageResult,
} from '@handlers/v1/books/interfaces/books.types'
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
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

  async createItem(params: BooksCreateItemParams) {
    const input: PutItemCommandInput = {
      TableName: this.tableName,
      Item: params.item,
      ConditionExpression:
        params.conditionExpression ?? 'attribute_not_exists(id)',
    }

    try {
      await this.client.send(new PutItemCommand(input))
    } catch (err) {
      throw new Error(String(err) || 'Error creating item in DynamoDB')
    }
  }

  //   async getItem(key: Record<string, any>) {
  //     const input: GetItemCommandInput = {
  //       TableName: this.tableName,
  //       Key: key,
  //     }

  //     const result = await this.client.send(new GetItemCommand(input))
  //     return result.Item || null
  //   }

  //   async updateItem(params: any) {
  //     const input: UpdateItemCommandInput = {
  //       TableName: this.tableName,
  //       Key: params.key,
  //       UpdateExpression: params.updateExpression,
  //       ExpressionAttributeNames: params.expressionAttributeNames,
  //       ExpressionAttributeValues: params.expressionAttributeValues,
  //       ConditionExpression: params.conditionExpression,
  //       ReturnValues: (params.returnValues as ReturnValue) || 'ALL_NEW',
  //     }

  //     const result = await this.client.send(new UpdateItemCommand(input))
  //     return result.Attributes || null
  //   }

  //   async deleteItem(params: any) {
  //     const input: DeleteItemCommandInput = {
  //       TableName: this.tableName,
  //       Key: params.key,
  //       ConditionExpression: params.conditionExpression,
  //     }

  //     await this.client.send(new DeleteItemCommand(input))
  //   }

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

    const result = await this.client.send(new QueryCommand(input))

    return {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    }
  }

  async scanPage(params: BooksScanPageParams): Promise<BooksScanPageResult> {
    const input: ScanCommandInput = {
      TableName: this.tableName,
      Limit: params.limit,
      ExclusiveStartKey: params.lastEvaluatedKey,
    }

    const result = await this.client.send(new ScanCommand(input))

    return {
      items: result.Items ?? [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    }
  }
}
