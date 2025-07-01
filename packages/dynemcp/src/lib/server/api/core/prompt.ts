// prompt.ts
// API funcional para DyneMCP Prompts
// -----------------------------------

import type { LoadedPrompt, PromptArgument, PromptMessage } from './interfaces'
import { z } from 'zod'

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
  argsSchema?: z.ZodRawShape | Record<string, z.ZodTypeAny>
  getMessages: (args?: Record<string, string>) => Promise<PromptMessage[]>
  complete?: (params: {
    argument: string
    partialInput: string
    context?: Record<string, unknown>
  }) => Promise<string[]> | string[]
}): LoadedPrompt {
  return {
    name: config.name,
    description: config.description ?? '',
    arguments: config.arguments,
    argsSchema: config.argsSchema,
    getMessages: config.getMessages,
    complete: config.complete,
  }
}
