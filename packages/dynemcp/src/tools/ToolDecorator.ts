import { z } from 'zod'
import { ToolDefinition } from '../core/dynemcp'

/**
 * Tool decorator options
 */
export interface ToolOptions {
  name?: string
  description?: string
  annotations?: Record<string, any>
}

/**
 * Convert a Zod schema to a JSON Schema for tool parameters
 *
 * @param schema - The Zod schema to convert
 * @returns The JSON Schema representation
 */
function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, z.ZodType> {
  // This is a simplified implementation
  // A complete implementation would handle all Zod types

  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape()
    const properties: Record<string, z.ZodType> = {}

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = value as z.ZodType
    }

    return properties
  } else {
    // Default to empty object if we can't determine the type
    return {}
  }
}

/**
 * Create a tool definition from a function and Zod schema
 *
 * @param fn - The function to create a tool from
 * @param paramsSchema - The Zod schema for the parameters
 * @param options - Tool options
 * @returns The tool definition
 */
export function createTool(
  fn: (...args: any[]) => any,
  paramsSchema: z.ZodTypeAny,
  options: ToolOptions = {}
): ToolDefinition {
  const name = options.name || fn.name
  const description = options.description || ''

  const schema = zodToJsonSchema(paramsSchema)

  return {
    name,
    description,
    schema,
    handler: fn,
  }
}

/**
 * Tool decorator factory
 *
 * @param options - Tool options
 * @returns The tool decorator
 */
export function tool(options: ToolOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    // Store the tool definition on the method
    originalMethod.toolDefinition = {
      name: options.name || propertyKey,
      description: options.description || '',
      schema: {},
      handler: originalMethod,
    }

    return descriptor
  }
}
