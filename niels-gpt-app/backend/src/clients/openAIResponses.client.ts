import OpenAI from 'openai'
import { env } from '@/lib/env.lib'

// TODO - Move the types to an external file once there be a lot
type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class OpenAIResponsesClient {
  private openAI: OpenAI
  private apiKey = env.OPENAI_API_KEY
  private apiModel = 'gpt-4.1-nano'

  constructor() {
    this.openAI = new OpenAI({ apiKey: this.apiKey })
  }

  async *generateText(input: string | Message[]): AsyncGenerator<string> {
    const events = await this.openAI.responses.create({
      model: this.apiModel,
      input,
      stream: true,
    })

    for await (const chunk of events) {
      const outputChunk = chunk as { output_text?: string }
      if (outputChunk.output_text) {
        yield outputChunk.output_text
      }
    }
  }
}
