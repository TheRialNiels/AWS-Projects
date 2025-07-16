import OpenAI from 'openai'

// TODO - Move the types to an external file once there be a lot
type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class OpenAIResponsesClient {
  private openAI: OpenAI
  private apiModel = 'gpt-4.1-nano'

  constructor(apiKey: string) {
    this.openAI = new OpenAI({ apiKey })
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
