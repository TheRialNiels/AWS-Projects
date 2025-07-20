import OpenAI from 'openai'
import type { ResponseStreamEvent } from 'openai/resources/responses/responses'
import { SecretsManagerService } from '@/clients/secretsManager.client'
import { generateThreadTitleInstructions } from '@/resources/instructions/generateThreadTitle'
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

  async initializeOpenAI(): Promise<void> {
    if (!this.openAI) {
      const { apiKey } = await this.secretsManager.getSecret(
        promptsEnvs.OPENAI_API_KEY_SECRET_ARN,
      )
      this.openAI = new OpenAI({ apiKey })
    }
  }

  async generateThreadTitle(input: string | Message[]): Promise<string> {
    const instructions = generateThreadTitleInstructions
    const response = await this.openAI!.responses.create({
      model: this.apiModel,
      instructions,
      input,
    })
    return response.output_text || ''
  }

  async *generateText(
    input: string | Message[],
  ): AsyncGenerator<ResponseStreamEvent> {
    const events = await this.openAI!.responses.create({
      model: this.apiModel,
      input,
      stream: true,
      max_output_tokens: 16,
    })

    for await (const event of events) {
      yield event
    }
  }
}
