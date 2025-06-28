import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
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
}
