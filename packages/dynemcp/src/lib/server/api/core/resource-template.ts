import type { ResourceTemplateDefinition } from './interfaces'
import type { ZodSchema } from 'zod'

/**
 * Functional API to define resource templates (dynamic resources) in DyneMCP.
 * Allows a simple and flexible syntax:
 *
 * export default resourceTemplate({ uriTemplate, name, description, mimeType, paramsSchema, getContent })
 */
export function resourceTemplate(config: {
  uriTemplate: string
  name: string
  description?: string
  mimeType?: string
  paramsSchema?: ZodSchema<any>
  getContent: (params: Record<string, string>) => Promise<string> | string
}): ResourceTemplateDefinition {
  return {
    uriTemplate: config.uriTemplate,
    name: config.name,
    description: config.description,
    mimeType: config.mimeType,
    async getContent(params) {
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
  }
}
