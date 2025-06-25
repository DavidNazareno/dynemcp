import type { PromptDefinition, PromptMessage } from '@dynemcp/dynemcp'

const systemPrompt: PromptDefinition = {
  name: 'system-prompt',
  description: 'A generic system prompt.',
  async getMessages(): Promise<PromptMessage[]> {
    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'You are a helpful assistant.',
        },
      } as PromptMessage,
    ]
  },
}

export default systemPrompt
