// resource.ts
// Functional API for DyneMCP Resources
// -------------------------------------
//
// - Provides a type-safe, functional API for defining static and dynamic resources.
// - Exposes helpers for resource creation and metadata extraction.
// - Used by resource modules to register MCP-compatible resources.

import type { ResourceDefinition } from './interfaces'
import type { ZodSchema } from 'zod'

/**
 * Defines a DyneMCP resource (static or dynamic) in a simple, type-safe way.
 *
 * Usage example:
 *
 * export default resource({
 *   uri: 'resource://my-resource',
 *   name: 'My Resource',
 *   description: 'A sample resource',
 *   mimeType: 'application/json',
 *   getContent: () => '{ "hello": "world" }',
 * })
 *
 * @param config - Resource configuration object
 *   - uri: Unique resource URI (required)
 *   - name: Human-readable name (required)
 *   - description: Optional description
 *   - mimeType: Optional MIME type (e.g. 'application/json')
 *   - paramsSchema: Optional Zod schema for validating params
 *   - getContent: Function to return the resource content (string or Promise<string>)
 *   - complete: (Advanced) Optional completion function for argument suggestions
 * @returns ResourceDefinition (MCP-compatible)
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
    // complete: config.complete, // Not allowed by ResourceDefinition type in SDK
  }
}

/**
 * Extracts all MCP-required metadata from a resource for listing.
 * Includes uri, name, description, mimeType, size, and any params/parameters if present.
 * @param resource ResourceDefinition (MCP plain object)
 */
export function getResourceMeta(resource: ResourceDefinition) {
  // Omit internal functions, but include all metadata
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, getContent, paramsSchema, complete, ...meta } =
    resource as any
  // If params/parameters exist, include them
  if ('params' in resource) meta.params = (resource as any).params
  if ('parameters' in resource) meta.parameters = (resource as any).parameters
  return meta
}
