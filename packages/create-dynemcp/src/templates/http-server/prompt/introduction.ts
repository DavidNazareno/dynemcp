import { PromptDefinition, PromptMessage } from '@dynemcp/dynemcp'

const introductionPrompt: PromptDefinition = {
  name: 'introduction',
  description: 'A system prompt to introduce the model to its capabilities.',
  async getMessages(): Promise<PromptMessage[]> {
    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are a helpful assistant running on the dynemcp framework.
Use the "greet" tool to greet users and access the "server-info" resource for information.`,
        },
      } as PromptMessage,
    ]
  },
}

export default introductionPrompt
