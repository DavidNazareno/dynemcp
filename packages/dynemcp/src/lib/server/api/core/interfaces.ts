// interfaces.ts
// Public types and interfaces for the DyneMCP API module
// ------------------------------------------------------

import { z } from 'zod'

/**
 * Tool argument definition for prompts.
 */
export interface PromptArgument {
  name: string
  description?: string
  required?: boolean
  type?: string
  default?: string
}

/**
 * Message format for prompts.
 */
export interface PromptMessage {
  role: 'user' | 'assistant'
  content: { type: string; [key: string]: unknown }
}

/**
 * Result format for tool execution.
 */
export interface CallToolResult {
  content: Array<{ type: string; [key: string]: unknown }>
  isError?: boolean
}

/**
 * Tool definition interface for DyneMCP tools.
 */
export interface ToolDefinition {
  name: string
  description?: string
  inputSchema?: z.ZodRawShape | Record<string, unknown>
  annotations?: Record<string, unknown>
  execute: (args: Record<string, unknown>) => Promise<CallToolResult>
}

/**
 * Resource definition interface for DyneMCP resources.
 */
export interface ResourceDefinition {
  uri: string
  name: string
  description?: string
  mimeType?: string
  content: string | (() => string | Promise<string>)
  contentType?: string
}

/**
 * Prompt definition interface for DyneMCP prompts.
 */
export interface PromptDefinition {
  name: string
  description?: string
  arguments?: PromptArgument[]
  getMessages: (args?: Record<string, string>) => Promise<PromptMessage[]>
}

/**
 * Type utility for inferring types from Zod schemas.
 */
export type InferSchema<T> = T extends z.ZodType ? z.infer<T> : never

// No additional interfaces are needed here, as the main API classes are abstract classes.
