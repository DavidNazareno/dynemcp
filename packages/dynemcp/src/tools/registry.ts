/**
 * Tool registry for DyneMCP framework
 */

import { z } from 'zod'
import { ToolDefinition } from '../core/dynemcp/interfaces.ts'

// Collection of registered tools
const toolRegistry: Map<string, ToolDefinition> = new Map()

/**
 * Register a tool in the registry
 *
 * @param tool - The tool to register
 */
export function registerTool(tool: ToolDefinition): void {
  if (toolRegistry.has(tool.name)) {
    console.warn(
      `Tool '${tool.name}' is already registered. It will be overwritten.`
    )
  }

  toolRegistry.set(tool.name, tool)
}

/**
 * Get all registered tools
 *
 * @returns Array of registered tools
 */
export function getAllTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values())
}

/**
 * Get a specific tool by name
 *
 * @param _name - The name of the tool to get
 * @returns The tool or undefined if not found
 */
export function getTool(_name: string): ToolDefinition | undefined {
  return toolRegistry.get(_name)
}

/**
 * Clear all registered tools
 */
export function clearTools(): void {
  toolRegistry.clear()
}

/**
 * Create a tool definition from a function and schema
 *
 * @param name - The name of the tool
 * @param description - The description of the tool
 * @param schema - The Zod schema for the tool parameters
 * @param handler - The function that implements the tool
 * @param _options - Additional tool options
 * @returns The created tool
 */
export function createTool<T extends z.ZodType>(
  name: string,
  description: string,
  schema: T,
  handler: (params: z.infer<T>) => any | Promise<any>,
  _options: {
    returns?: {
      type: string
      description?: string
    }
    annotations?: Record<string, any>
  } = {}
): ToolDefinition {
  // Convert Zod schema to JSON Schema
  const jsonSchema = zodToJsonSchema(schema)

  const tool: ToolDefinition = {
    name,
    description,
    schema: jsonSchema.properties || {},
    handler, // Store the handler function on the tool object for execution
  }

  // Register the tool
  registerTool(tool)

  return tool
}

/**
 * Tool decorator for class methods
 *
 * @param name - The name of the tool
 * @param description - The description of the tool
 * @param schema - The Zod schema for the tool parameters
 * @param _options - Additional tool options
 * @returns The method decorator
 */
export function tool<T extends z.ZodType>(
  name: string,
  description: string,
  schema: T,
  _options: {
    returns?: {
      type: string
      description?: string
    }
    annotations?: Record<string, any>
  } = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    // Convert Zod schema to JSON Schema
    const jsonSchema = zodToJsonSchema(schema)

    const tool: ToolDefinition = {
      name: name || propertyKey,
      description,
      schema: jsonSchema.properties || {},
      handler: originalMethod,
    }

    // Register the tool
    registerTool(tool)

    return descriptor
  }
}

/**
 * Convert a Zod schema to a JSON Schema
 *
 * @param schema - The Zod schema to convert
 * @returns The JSON Schema representation
 */
function zodToJsonSchema(schema: any): {
  type: string
  properties?: Record<string, any>
  required?: string[]
  items?: any
  enum?: any[]
} {
  // This is a simplified implementation
  // A complete implementation would handle all Zod types

  if (schema instanceof z.ZodString) {
    const base: any = { type: 'string' }

    // Add string constraints if defined
    if ((schema as any)._def.minLength !== undefined) {
      base.minLength = (schema as any)._def.minLength
    }
    if ((schema as any)._def.maxLength !== undefined) {
      base.maxLength = (schema as any)._def.maxLength
    }

    return base
  } else if (schema instanceof z.ZodNumber) {
    const base: any = { type: 'number' }

    // Add number constraints if defined
    if ((schema as any)._def.minimum !== undefined) {
      base.minimum = (schema as any)._def.minimum
    }
    if ((schema as any)._def.maximum !== undefined) {
      base.maximum = (schema as any)._def.maximum
    }

    return base
  } else if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' }
  } else if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema.element),
    }
  } else if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape()
    const properties: Record<string, any> = {}
    const required: string[] = []

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value)

      // Check if the property is required
      if (!(value instanceof z.ZodOptional)) {
        required.push(key)
      }

      // Add description if available
      const description = (value as any)._def.description
      if (description) {
        properties[key].description = description
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    }
  } else if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema._def.values,
    }
  } else if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap())
  } else {
    // Default to any type if we can't determine the type
    return { type: 'object' }
  }
}
