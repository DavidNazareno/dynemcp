// prompt.ts
// Functional API for DyneMCP Prompts
// -----------------------------------
//
// - Provides a type-safe, functional API for defining prompt templates and workflows.
// - Prompts can accept arguments, validate input, generate dynamic messages, and support argument completion.
// - Used by prompt modules to register MCP-compatible prompts.

import type { LoadedPrompt, PromptArgument, PromptMessage } from './interfaces'
import type { ZodRawShape, ZodTypeAny } from 'zod'

/**
 * Defines a DyneMCP prompt (prompt template or workflow) in a simple, type-safe way.
 * Prompts can accept arguments, generate dynamic messages, and optionally provide argument completion.
 *
 * Usage example:
 *
 * export default prompt({
 *   name: 'my-prompt',
 *   description: 'A sample prompt',
 *   arguments: [
 *     { name: 'topic', description: 'Topic to discuss', required: true },
 *   ],
 *   getMessages: async (args) => [...],
 * })
 *
 * @param config - Prompt configuration object
 *   - name: Unique prompt name (required)
 *   - description: Optional description
 *   - arguments: Optional list of argument definitions
 *   - argsSchema: Optional Zod schema for argument validation
 *   - getMessages: Function to generate prompt messages (required)
 *   - complete: (Advanced) Optional completion function for argument suggestions
 * @returns LoadedPrompt (MCP-compatible)
 */
export function prompt(config: {
  name: string
  description?: string
  arguments?: PromptArgument[]
  argsSchema?: ZodRawShape | Record<string, ZodTypeAny>
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
    arguments: config.arguments as unknown as
      | {
          [x: string]: unknown
          name: string
          description?: string
          required?: boolean
        }[]
      | undefined,
    argsSchema: config.argsSchema,
    getMessages: config.getMessages,
    complete: config.complete,
  }
}
