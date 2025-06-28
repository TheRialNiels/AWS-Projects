import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb'
import type { UploadsFilesCreateItemParams, Item } from '@interfaces/books-uploads.types'

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

  async getItem(updateId: string, userId: string): Promise<GetItemCommandOutput> {
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
}
