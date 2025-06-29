import type { PromptDefinition, PromptMessage } from '@dynemcp/dynemcp'

const calculatorPrompt: PromptDefinition = {
  name: 'calculator-prompt',
  description: 'A prompt for a calculator assistant.',
  async getMessages(): Promise<PromptMessage[]> {
    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'You are a helpful calculator assistant. You can perform mathematical operations and evaluate expressions.',
        },
      } as PromptMessage,
    ]
  },
}

export default calculatorPrompt
