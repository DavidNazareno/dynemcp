// resource.ts
// API funcional para DyneMCP Resources
// -------------------------------------

import type { ResourceDefinition } from './interfaces'
import type { ZodSchema } from 'zod'

/**
 * Nueva API funcional para definir recursos (resources) de DyneMCP.
 * Permite una sintaxis simple y flexible:
 *
 * export default resource({ uri, name, description, mimeType, paramsSchema, getContent })
 */
export function resource(config: {
  uri: string
  name: string
  description?: string
  mimeType?: string
  paramsSchema?: ZodSchema<any>
  getContent: (params?: Record<string, any>) => string | Promise<string>
  complete?: (params: {
    argument: string
    partialInput: string
    context?: Record<string, unknown>
  }) => Promise<string[]> | string[]
}): ResourceDefinition {
  return {
    uri: config.uri,
    name: config.name,
    description: config.description,
    async content(params?: Record<string, any>) {
      if (config.paramsSchema) {
        const parsed = config.paramsSchema.safeParse(params)
        if (!parsed.success) {
          throw new Error(
            'Invalid parameters: ' + JSON.stringify(parsed.error.format())
          )
        }
        return config.getContent(parsed.data)
      }
      return config.getContent(params)
    },
    // complete: config.complete, // No permitido por el tipo ResourceDefinition del SDK
  }
}
