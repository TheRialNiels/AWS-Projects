import OpenAI from 'openai'
import { SecretsManagerService } from '@/clients/secretsManager.client'
import { promptsEnvs } from '@/lib/env.lib'

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class OpenAIResponsesClient {
  private openAI: OpenAI | null = null
  private apiModel = 'gpt-4.1-nano'
  private secretsManager: SecretsManagerService

  constructor() {
    this.secretsManager = new SecretsManagerService(promptsEnvs.REGION)
  }

  private async initializeOpenAI(): Promise<void> {
    if (!this.openAI) {
      const { apiKey } = await this.secretsManager.getSecret(
        promptsEnvs.OPENAI_API_KEY_SECRET_ARN,
      )
      this.openAI = new OpenAI({ apiKey })
    }
  }

  async *generateText(input: string | Message[]): AsyncGenerator<string> {
    await this.initializeOpenAI()

    const events = await this.openAI!.responses.create({
      model: this.apiModel,
      input,
      stream: true,
      max_output_tokens: 16,
    })

    for await (const chunk of events) {
      if (chunk.type === 'response.output_text.delta' && chunk.delta) {
        yield chunk.delta
      }
    }
  }
}
