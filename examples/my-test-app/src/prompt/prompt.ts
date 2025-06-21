import { DyneMCPPrompt } from '@dynemcp/dynemcp'

export class SystemPrompt extends DyneMCPPrompt {
  readonly id = 'system-prompt'
  readonly name = 'System'
  readonly description = 'A generic system prompt.'

  getContent(): string {
    return 'You are a helpful assistant.'
  }
}

export default new SystemPrompt()
