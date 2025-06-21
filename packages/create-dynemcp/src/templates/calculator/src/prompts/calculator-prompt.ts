import { DyneMCPPrompt } from '@dynemcp/dynemcp'

export class CalculatorPrompt extends DyneMCPPrompt {
  readonly id = 'calculator-prompt'
  readonly name = 'Calculator'
  readonly description =
    'A prompt that provides context for the calculator agent.'

  getContent(): string {
    return 'You are a helpful calculator assistant. Use the available tools to answer the user request.'
  }
}

export default new CalculatorPrompt()
