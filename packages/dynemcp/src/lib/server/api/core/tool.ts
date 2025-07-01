// tool.ts
// Base class and helpers for DyneMCP Tools
// ----------------------------------------

import { z } from 'zod'
import type { LoadedTool, CallToolResult } from './interfaces'
import { withErrorHandling } from './utils'

/**
 * Simplified typed tool creator function
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
}): LoadedTool {
  return {
    name: config.name,
    description: config.description,
    inputSchema: config.inputSchema ?? config.schema.shape,
    outputSchema: config.outputSchema,
    annotations: config.annotations,
    execute: withErrorHandling(config.execute as any),
    parameters: {}, // Optionally fill if needed
  }
}

/**
 * Nueva API funcional para definir herramientas (tools) de DyneMCP.
 * Permite una sintaxis simple y flexible:
 *
 * export default tool(schema, handler, options)
 */
export function tool<
  T extends z.ZodObject<z.ZodRawShape>,
  Meta extends Record<string, any> = Record<string, any>,
>(
  schema: T,
  handler: (input: z.infer<T>) => Promise<CallToolResult> | CallToolResult,
  options: {
    name: string
    description?: string
    inputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
    outputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
    annotations?: Record<string, unknown>
    meta?: Meta
  }
): LoadedTool {
  return {
    name: options.name,
    description: options.description ?? '',
    inputSchema: options.inputSchema ?? schema.shape,
    outputSchema: options.outputSchema,
    annotations: options.annotations ?? options.meta,
    execute: withErrorHandling(handler as any),
    parameters: {}, // Optionally fill if needed
  }
}
