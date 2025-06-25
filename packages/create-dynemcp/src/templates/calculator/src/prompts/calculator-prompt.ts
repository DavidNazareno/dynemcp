import { DyneMCPPrompt, PromptMessage } from '@dynemcp/dynemcp'

export class CalculatorPrompt extends DyneMCPPrompt {
  readonly name = 'calculator-prompt'
  readonly description =
    'A prompt that provides context for the calculator agent.'
  readonly arguments = []

  async getMessages(): Promise<PromptMessage[]> {
    return [
      this.createTextMessage(
        'user',
        'You are a helpful calculator assistant. Use the available tools to answer the user request.'
      ),
    ]
  }
}

export default new CalculatorPrompt()
