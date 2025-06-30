// tool.ts
// Base class and helpers for DyneMCP Tools
// ----------------------------------------

import { z, type ZodRawShape } from 'zod'
import type { ToolDefinition, CallToolResult } from './interfaces'
import { withErrorHandling } from './utils'

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
 * Base class for all MCP Tools
 * Provides a consistent interface and automatic type inference
 */
export abstract class DyneMCPTool {
  [key: string]: unknown

  abstract readonly name: string
  abstract readonly description?: string
  abstract readonly inputSchema: Record<string, z.ZodTypeAny>
  readonly annotations?: {
    title?: string
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
    openWorldHint?: boolean
  }

  /**
   * Execute the tool with properly typed input
   */
  abstract execute(input: Record<string, unknown>): Promise<unknown> | unknown

  /**
   * Convert the tool to ToolDefinition format that's compatible with MCP SDK
   */
  toDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema as ZodRawShape,
      annotations: this.annotations,
      execute: withErrorHandling(this.execute.bind(this) as any),
    }
  }
}
