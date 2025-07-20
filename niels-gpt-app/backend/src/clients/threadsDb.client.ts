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

  async createThread(data: Thread) {
    const params = {
      item: data,
      conditionExpression:
        'attribute_not_exists(userId) AND attribute_not_exists(threadId)',
    }

    try {
      await this.client.createCommand(params.item, params.conditionExpression)
    } catch (err) {
      throw err
    }
  }

  async getThread(userId: string, threadId: string) {
    const item = {
      userId,
      threadId,
    }

    try {
      const result = await this.client.getCommand(item)
      if (!result.Item) {
        return null
      }

      return result.Item
    } catch (err) {
      throw err
    }
  }

  async verifyThreadExists(userId: string, threadId: string): Promise<boolean> {
    try {
      const result = await this.getThread(userId, threadId)

      return !!result
    } catch (err) {
      throw err
    }
  }
}
