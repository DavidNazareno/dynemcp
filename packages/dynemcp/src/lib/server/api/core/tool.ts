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
  // Simple object { text: ... }
  if (
    result &&
    typeof result === 'object' &&
    'text' in result &&
    !result.type
  ) {
    return { content: [{ type: 'text', text: result.text }] }
  }
  // Array of strings or objects
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
      // If not valid, stringify it
      return { type: 'text', text: JSON.stringify(item) }
    })
    return { content }
  }
  // If it is not a valid object, return MCP error
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
 * Wrapper for error handling and MCP result normalization.
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
 * Simplified typed tool creator function.
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
  const inputSchema = config.inputSchema ?? config.schema
  return {
    name: config.name,
    description: config.description,
    inputSchema: {
      type: 'object',
      ...(zodToJsonSchema(inputSchema).properties && {
        properties: zodToJsonSchema(inputSchema).properties,
      }),
      ...(zodToJsonSchema(inputSchema).required && {
        required: zodToJsonSchema(inputSchema).required,
      }),
    },
    outputSchema: config.outputSchema
      ? {
          type: 'object',
          ...(zodToJsonSchema(config.outputSchema).properties && {
            properties: zodToJsonSchema(config.outputSchema).properties,
          }),
          ...(zodToJsonSchema(config.outputSchema).required && {
            required: zodToJsonSchema(config.outputSchema).required,
          }),
        }
      : undefined,
    annotations: config.annotations,
    execute: withErrorHandling(config.execute as any),
    parameters: {}, // Optionally fill if needed
    complete: config.complete,
  }
}

/**
 * Functional API for defining DyneMCP tools.
 * Allows simple and flexible syntax for tool definition and execution.
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
  const inputSchema = options.inputSchema ?? schema
  return {
    name: options.name,
    description: options.description ?? '',
    inputSchema: {
      type: 'object',
      ...(zodToJsonSchema(inputSchema).properties && {
        properties: zodToJsonSchema(inputSchema).properties,
      }),
      ...(zodToJsonSchema(inputSchema).required && {
        required: zodToJsonSchema(inputSchema).required,
      }),
    },
    outputSchema: options.outputSchema
      ? {
          type: 'object',
          ...(zodToJsonSchema(options.outputSchema).properties && {
            properties: zodToJsonSchema(options.outputSchema).properties,
          }),
          ...(zodToJsonSchema(options.outputSchema).required && {
            required: zodToJsonSchema(options.outputSchema).required,
          }),
        }
      : undefined,
    annotations: options.annotations ?? options.meta,
    execute: withErrorHandling(handler as any),
    parameters: {}, // Optionally fill if needed
    complete: options.complete,
  }
}
