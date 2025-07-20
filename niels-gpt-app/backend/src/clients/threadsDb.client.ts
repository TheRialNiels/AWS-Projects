import { DynamoDbClient } from '@/clients/dynamoDb.client'
import type { Thread } from '@/interfaces/threads.types'

interface ThreadsDbConfig {
  region: string
  table: string
}

export class ThreadsDbClient {
  private client: DynamoDbClient

  constructor(config: ThreadsDbConfig) {
    this.client = new DynamoDbClient({
      region: config.region,
      table: config.table,
    })
  }

  async createThread(data: Thread): Promise<any> {
    const params = {
      item: data,
      conditionExpression:
        'attribute_not_exists(userId) AND attribute_not_exists(threadId)',
    }

    await this.client.createCommand(params.item, params.conditionExpression)
  }
}
