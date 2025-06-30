// prompt.ts
// Base class for DyneMCP Prompts
// -----------------------------

import type {
  PromptDefinition,
  PromptArgument,
  PromptMessage,
} from './interfaces'

/**
 * Base class for all MCP Prompts
 */
export abstract class DyneMCPPrompt implements PromptDefinition {
  [key: string]: unknown

  abstract readonly name: string
  abstract readonly description?: string
  abstract readonly arguments?: PromptArgument[]

  /**
   * Get the messages for this prompt
   * @param args The arguments passed to the prompt
   */
  abstract getMessages(args?: Record<string, string>): Promise<PromptMessage[]>

  /**
   * Helper to create a text message
   */
  protected createTextMessage(
    role: 'user' | 'assistant',
    text: string
  ): PromptMessage {
    return {
      role,
      content: {
        type: 'text',
        text,
      },
    } as PromptMessage
  }

  /**
   * Helper to create a resource message
   */
  protected createResourceMessage(
    role: 'user' | 'assistant',
    uri: string,
    text: string,
    mimeType?: string
  ): PromptMessage {
    return {
      role,
      content: {
        type: 'resource',
        resource: {
          uri,
          text,
          mimeType,
        },
      },
    } as PromptMessage
  }

  /**
   * Validate required arguments
   */
  protected validateArgs(args?: Record<string, string>): void {
    if (!this.arguments) return

    for (const arg of this.arguments) {
      if (arg.required && (!args || !args[arg.name])) {
        throw new Error(`Required argument '${arg.name}' is missing`)
      }
    }
  }

  /**
   * Convert the prompt to Prompt format
   */
  toDefinition(): PromptDefinition {
    return {
      name: this.name,
      description: this.description,
      arguments: this.arguments,
      getMessages: this.getMessages.bind(this),
    }
  }
}
