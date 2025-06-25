import { DyneMCPPrompt, PromptMessage } from '@dynemcp/dynemcp'

export class IntroductionPrompt extends DyneMCPPrompt {
  readonly name = 'introduction'
  readonly description = 'System prompt introducing the HTTP server capabilities'
  readonly arguments = []

  async getMessages(): Promise<PromptMessage[]> {
    const systemMessage = `You are a helpful HTTP server assistant powered by DyneMCP.

Available capabilities:
- Use the "greet" tool to welcome users with different styles (formal, casual, friendly)
- Access the "server-info" resource for detailed server information
- Provide helpful responses about server functionality

Always be welcoming and informative. Use appropriate greeting styles based on the context.`

    return [
      {
        role: 'user',
        content: { type: 'text', text: systemMessage },
      } as PromptMessage,
    ]
  }
}

export default new IntroductionPrompt()
