// tool.ts
// Functional API for DyneMCP Tools
// -----------------------------------
//
// - Provides a type-safe, functional API for defining and executing MCP tools.
// - Normalizes tool results to MCP protocol format and handles errors robustly.
// - Used by tool modules to register MCP-compatible tools.

import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { LoadedTool, CallToolResult } from './interfaces'

/**
 * MCP type for a tool content item (text, image, embedded resource, etc.)
 */
export type ContentItem =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'embedded_resource'; uri: string; [key: string]: any }
  | { type: string; [key: string]: any }

/**
 * Normalizes the result of a tool to MCP protocol format.
 * Handles strings, objects, arrays, and error cases.
 *
 * @param result - The raw result returned by a tool handler
 * @returns An object in MCP protocol format, or an error object if invalid
 */
function normalizeToolResult(result: any) {
  // String simple
  if (typeof result === 'string') {
    return { content: [{ type: 'text', text: result }] }
  }
  // Valid MCP object
  if (result && typeof result === 'object' && Array.isArray(result.content)) {
    return result
  }
  // ContentItem
  if (
    result &&
    typeof result === 'object' &&
    result.type &&
    (result.text || result.url || result.uri)
  ) {
    return { content: [result] }
  }
  if (
    result &&
    typeof result === 'object' &&
    'text' in result &&
    !result.type
  ) {
    return { content: [{ type: 'text', text: result.text }] }
  }
  if (Array.isArray(result)) {
    const content = result.map((item) => {
      if (typeof item === 'string') {
        return { type: 'text', text: item }
      }
      if (item && typeof item === 'object' && 'text' in item && !item.type) {
        return { type: 'text', text: item.text }
      }
      if (
        item &&
        typeof item === 'object' &&
        item.type &&
        (item.text || item.url || item.uri)
      ) {
        return item
      }
      return { type: 'text', text: JSON.stringify(item) }
    })
    return { content }
  }
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: `Invalid tool return value: ${JSON.stringify(result)}`,
      },
    ],
  }
}

/**
 * Wraps a tool handler function with error handling and MCP result normalization.
 * Ensures that any thrown errors are caught and returned in a standard format.
 *
 * @param fn - The tool handler function to wrap
 * @returns An async function that returns a normalized MCP result or error
 */
function withErrorHandling<T extends (...args: any[]) => any>(fn: T): T {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args)
      return normalizeToolResult(result)
    } catch (error: any) {
      return {
        isError: true,
        content: [
          { type: 'text', text: `Error: ${error?.message || String(error)}` },
        ],
      }
    }
  }) as T
}

/**
 * Defines a DyneMCP tool using a configuration object with strong typing.
 *
 * Usage example:
 *
 * export const myTool = createTypedTool({
 *   name: 'my-tool',
 *   description: 'A sample tool',
 *   schema: z.object({ input: z.string() }),
 *   execute: async (input) => ({ content: [{ type: 'text', text: 'Hello ' + input.input }] })
 * })
 *
 * @param config - Tool configuration object
 *   - name: Unique tool name (required)
 *   - description: Tool description (required)
 *   - schema: Zod schema for input validation (required)
 *   - inputSchema: (Optional) Zod schema or shape for input
 *   - outputSchema: (Optional) Zod schema or shape for output
 *   - annotations: (Optional) Additional metadata
 *   - execute: Tool handler function (required)
 *   - complete: (Optional) Completion function for argument suggestions
 * @returns LoadedTool (MCP-compatible)
 */
export function createTypedTool<T extends z.ZodObject<z.ZodRawShape>>(config: {
  name: string
  description: string
  schema: T
  inputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
  outputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
  annotations?: Record<string, unknown>
  execute: (
    input: z.infer<T>
  ) => Promise<CallToolResult> | CallToolResult | string | unknown
  complete?: (params: {
    argument: string
    partialInput: string
    context?: Record<string, unknown>
  }) => Promise<string[]> | string[]
}): LoadedTool {
  const inputSchema =
    config.inputSchema instanceof z.ZodType
      ? config.inputSchema
      : config.inputSchema && typeof config.inputSchema === 'object'
        ? z.object(config.inputSchema as z.ZodRawShape)
        : config.schema

  function extractPropertiesAndRequired(jsonSchema: any) {
    const result: any = {}
    if (jsonSchema && typeof jsonSchema === 'object') {
      if ('properties' in jsonSchema && jsonSchema.properties) {
        result.properties = jsonSchema.properties
      }
      if ('required' in jsonSchema && jsonSchema.required) {
        result.required = jsonSchema.required
      }
    }
    return result
  }

  let outputSchemaObj: any = undefined
  if (config.outputSchema) {
    const outputSchema =
      config.outputSchema instanceof z.ZodType
        ? config.outputSchema
        : z.object(config.outputSchema as z.ZodRawShape)
    const outputJsonSchema = zodToJsonSchema(outputSchema)
    outputSchemaObj = {
      type: 'object',
      ...extractPropertiesAndRequired(outputJsonSchema),
    }
  }

  return {
    name: config.name,
    description: config.description,
    inputSchema: inputSchema.shape,
    outputSchema: outputSchemaObj,
    annotations: config.annotations,
    execute: withErrorHandling(config.execute as any),
    parameters: {},
    complete: config.complete,
  }
}

/**
 * Defines a DyneMCP tool using a functional API for flexibility and simplicity.
 *
 * Usage example:
 *
 * export const myTool = tool(
 *   z.object({ input: z.string() }),
 *   async (input) => ({ content: [{ type: 'text', text: 'Hello ' + input.input }] }),
 *   {
 *     name: 'my-tool',
 *     description: 'A sample tool',
 *   }
 * )
 *
 * @param schema - Zod schema for input validation (required)
 * @param handler - Tool handler function (required)
 * @param options - Tool options object
 *   - name: Unique tool name (required)
 *   - description: Tool description (optional)
 *   - inputSchema: (Optional) Zod schema or shape for input
 *   - outputSchema: (Optional) Zod schema or shape for output
 *   - annotations: (Optional) Additional metadata
 *   - meta: (Optional) Extra metadata
 *   - complete: (Optional) Completion function for argument suggestions
 * @returns LoadedTool (MCP-compatible)
 */
export function tool<
  T extends z.ZodObject<z.ZodRawShape>,
  Meta extends Record<string, any> = Record<string, any>,
>(
  schema: T,
  handler: (input: z.infer<T>) => Promise<any> | any,
  options: {
    name: string
    description?: string
    inputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
    outputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
    annotations?: Record<string, unknown>
    meta?: Meta
    complete?: (params: {
      argument: string
      partialInput: string
      context?: Record<string, unknown>
    }) => Promise<string[]> | string[]
  }
): LoadedTool {
  const inputSchema =
    options.inputSchema instanceof z.ZodType
      ? options.inputSchema
      : options.inputSchema && typeof options.inputSchema === 'object'
        ? z.object(options.inputSchema as z.ZodRawShape)
        : schema

  function extractPropertiesAndRequired(jsonSchema: any) {
    const result: any = {}
    if (jsonSchema && typeof jsonSchema === 'object') {
      if ('properties' in jsonSchema && jsonSchema.properties) {
        result.properties = jsonSchema.properties
      }
      if ('required' in jsonSchema && jsonSchema.required) {
        result.required = jsonSchema.required
      }
    }
    return result
  }

  let outputSchemaObj: any = undefined
  if (options.outputSchema) {
    const outputSchema =
      options.outputSchema instanceof z.ZodType
        ? options.outputSchema
        : z.object(options.outputSchema as z.ZodRawShape)
    const outputJsonSchema = zodToJsonSchema(outputSchema)
    outputSchemaObj = {
      type: 'object',
      ...extractPropertiesAndRequired(outputJsonSchema),
    }
  }

  return {
    name: options.name,
    description: options.description ?? '',
    inputSchema: inputSchema.shape,
    outputSchema: outputSchemaObj,
    annotations: options.annotations ?? options.meta,
    execute: withErrorHandling(handler as any),
    parameters: {},
    complete: options.complete,
  }
}
