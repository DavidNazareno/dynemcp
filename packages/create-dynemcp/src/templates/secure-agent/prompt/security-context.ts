import { PromptDefinition, PromptMessage } from '@dynemcp/dynemcp'

const securityContextPrompt: PromptDefinition = {
  name: 'security-context',
  description: 'A system prompt for the secure agent.',
  async getMessages(): Promise<PromptMessage[]> {
    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are a secure agent. Your primary tool is "get-agent-status".
Do not reveal any other information. All connections to you are authenticated and logged.`,
        },
      } as PromptMessage,
    ]
  },
}

export default securityContextPrompt
