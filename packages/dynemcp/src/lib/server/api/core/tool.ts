// tool.ts
// Base class and helpers for DyneMCP Tools
// ----------------------------------------

import { z } from 'zod'
import type { ToolDefinition, CallToolResult } from './interfaces'
import { withErrorHandling } from './utils'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * Simplified typed tool creator function
 */
export function createTypedTool<T extends z.ZodObject<z.ZodRawShape>>(config: {
  name: string
  description: string
  schema: T
  annotations?: {
    title?: string
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
    openWorldHint?: boolean
  }
  execute: (
    input: z.infer<T>
  ) => Promise<CallToolResult> | CallToolResult | string | unknown
}): ToolDefinition {
  return {
    name: config.name,
    description: config.description,
    inputSchema: config.schema.shape,
    annotations: config.annotations,
    execute: withErrorHandling(config.execute as any),
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
    meta?: Meta
    annotations?: {
      title?: string
      readOnlyHint?: boolean
      destructiveHint?: boolean
      idempotentHint?: boolean
      openWorldHint?: boolean
      [key: string]: any
    }
  }
): ToolDefinition {
  return {
    name: options.name,
    description: options.description,
    inputSchema:
      zodToJsonSchema(schema).definitions?.Input || zodToJsonSchema(schema),
    annotations: options.annotations ?? options.meta,
    execute: withErrorHandling(handler as any),
  }
}
