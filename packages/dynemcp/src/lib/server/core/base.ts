import { z } from 'zod'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from './interfaces.js'

// Type utilities for inference
export type InferSchema<T> = T extends z.ZodType ? z.infer<T> : never
export type ToolInput<T> = T extends DyneMCPTool
  ? InferSchema<T['schema']>
  : never

/**
 * Base class for all MCP Tools
 * Provides a consistent interface and automatic type inference
 */
export abstract class DyneMCPTool {
  abstract readonly description: string
  abstract readonly schema: z.ZodType

  /**
   * Get the tool name from the class name
   */
  get name(): string {
    return this.constructor.name
  }

  /**
   * Execute the tool with properly typed input
   */
  abstract execute(input: ToolInput<this>): Promise<any> | any

  /**
   * Convert the tool to ToolDefinition format
   */
  toDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: this.schemaToJsonSchema(),
      handler: this.execute.bind(this),
    }
  }

  /**
   * Convert Zod schema to JSON Schema
   */
  private schemaToJsonSchema(): Record<string, any> {
    return zodToJsonSchema(this.schema)
  }
}

/**
 * Base class for all MCP Resources
 */
export abstract class DyneMCPResource {
  abstract readonly uri: string
  abstract readonly name: string
  abstract readonly description?: string
  abstract readonly contentType?: string

  /**
   * Get the resource content
   */
  abstract getContent(): string | Promise<string>

  /**
   * Convert the resource to ResourceDefinition format
   */
  toDefinition(): ResourceDefinition {
    return {
      uri: this.uri,
      name: this.name,
      content: this.getContent.bind(this),
      description: this.description,
      contentType: this.contentType || 'application/octet-stream',
    }
  }
}

/**
 * Base class for all MCP Prompts
 */
export abstract class DyneMCPPrompt {
  abstract readonly id: string
  abstract readonly name: string
  abstract readonly description?: string

  /**
   * Get the prompt content
   */
  abstract getContent(): string

  /**
   * Convert the prompt to PromptDefinition format
   */
  toDefinition(): PromptDefinition {
    return {
      id: this.id,
      name: this.name,
      content: this.getContent(),
      description: this.description,
    }
  }
}

/**
 * Helper function to convert Zod schema to JSON Schema
 */
function zodToJsonSchema(
  schema: z.ZodType<any, any, any>
): Record<string, any> {
  if (schema instanceof z.ZodString) {
    const base: any = { type: 'string' }
    if ((schema as any)._def.minLength !== undefined) {
      base.minLength = (schema as any)._def.minLength
    }
    if ((schema as any)._def.maxLength !== undefined) {
      base.maxLength = (schema as any)._def.maxLength
    }
    return base
  } else if (schema instanceof z.ZodNumber) {
    const base: any = { type: 'number' }
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
      properties[key] = zodToJsonSchema(value as z.ZodType<any, any, any>)
      if (!(value instanceof z.ZodOptional)) {
        required.push(key)
      }
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
    return { type: 'object' }
  }
}
