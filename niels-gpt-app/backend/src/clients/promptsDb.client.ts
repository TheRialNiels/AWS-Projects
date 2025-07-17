import { DynamoDbClient } from '@/clients/dynamoDb.client'
import type { Prompt } from '@/interfaces/prompts.types'

interface PromptsDbConfig {
  region: string
  table: string
}

export class PromptsDbClient {
  private client: DynamoDbClient

  constructor(config: PromptsDbConfig) {
    this.client = new DynamoDbClient({
      region: config.region,
      table: config.table,
    })
  }

  async createPrompt(data: Prompt): Promise<any> {
    const params = {
      item: data,
      conditionExpression:
        'attribute_not_exists(threadId) AND attribute_not_exists(createdAt)',
    }

    await this.client.createCommand(params.item, params.conditionExpression)
  }
}
