import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { DynamoDbClient } from '@/clients/dynamoDb.client'
import type { Prompt } from '@/interfaces/prompts.types'
import { QueryCommandParams } from '@/interfaces/dynamoDb.types'

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

  async getLatestPrompts(
    threadId: string,
  ): Promise<Record<string, AttributeValue>[]> {
    const params: QueryCommandParams = {
      keyConditionExpression: '#threadId = :threadId',
      expressionAttributeNames: { '#threadId': 'threadId' },
      expressionAttributeValues: {
        ':threadId': { S: threadId },
      },
      limit: 2,
      scanIndexForward: false,
    }

    try {
      const result = await this.client.queryCommand(params)
      result.Items
      if (!result.Items) {
        return []
      }

      return result.Items
    } catch (err) {
      throw err
    }
  }
}
