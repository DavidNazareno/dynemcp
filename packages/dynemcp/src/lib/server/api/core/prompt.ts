// prompt.ts
// API funcional para DyneMCP Prompts
// -----------------------------------

import type {
  PromptDefinition,
  PromptArgument,
  PromptMessage,
} from './interfaces'

/**
 * Nueva API funcional para definir prompts (prompts) de DyneMCP.
 * Permite una sintaxis simple y flexible:
 *
 * export default prompt({ name, description, arguments, getMessages })
 */
export function prompt(config: {
  name: string
  description?: string
  arguments?: PromptArgument[]
  getMessages: (args?: Record<string, string>) => Promise<PromptMessage[]>
}): PromptDefinition {
  return {
    name: config.name,
    description: config.description,
    arguments: config.arguments,
    getMessages: config.getMessages,
  }
}
