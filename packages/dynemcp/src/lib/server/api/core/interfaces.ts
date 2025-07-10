// interfaces.ts
// Public types and interfaces for the DyneMCP API module
// ------------------------------------------------------
//
// - Defines contracts for tools, prompts, resources, sampling, and roots.
// - Exposes both SDK-compatible types and internal types for loaded/executable logic.
// - Used throughout the API module for type safety and extension.

import { z } from 'zod'
import type { ZodRawShape, ZodTypeAny, ZodObject } from 'zod'
// Import types from the SDK
import type {
  Tool as SDKTool,
  Resource as SDKResource,
  Prompt as SDKPrompt,
  SamplingMessage as SDKSamplingMessage,
  CallToolResult as SDKCallToolResult,
  Root as SDKRoot,
  RootsListChangedNotification as SDKRootsListChangedNotification,
} from '@modelcontextprotocol/sdk/types.js'

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
export type CallToolResult = SDKCallToolResult

// SDK types for public API/interoperability
export type ToolDefinition = SDKTool
export type ResourceDefinition = SDKResource
export type PromptDefinition = SDKPrompt

// Internal types for loaded/executable logic
// LoadedTool tiene su propia definición con inputSchema como ZodRawShape
export interface LoadedTool {
  name: string
  description?: string
  inputSchema: z.ZodRawShape // <-- Solo ZodRawShape
  outputSchema?: {
    [x: string]: unknown
    type: 'object'
    properties?: { [x: string]: unknown }
    required?: string[]
  }
  annotations?: { [x: string]: unknown }
  execute: (
    args: Record<string, unknown>
  ) => Promise<CallToolResult> | CallToolResult
  parameters?: Record<string, unknown>
  complete?: (params: {
    argument: string
    partialInput: string
    context?: Record<string, unknown>
  }) => Promise<string[]> | string[]
}

export interface LoadedPrompt extends PromptDefinition {
  argsSchema?: ZodRawShape | Record<string, ZodTypeAny>
  getMessages: (args?: Record<string, string>) => Promise<PromptMessage[]>
  complete?: (params: {
    argument: string
    partialInput: string
    context?: Record<string, unknown>
  }) => Promise<string[]> | string[]
}

/**
 * Type utility for inferring types from Zod schemas.
 */
export type InferSchema<T> = T extends z.ZodType ? z.infer<T> : never

// Sampling types (MCP)
export type SamplingMessage = SDKSamplingMessage
// (There are no explicit SamplingRequest/SamplingResult in the SDK)

// SamplingRequest and SamplingResult according to the official MCP documentation
export interface SamplingRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content:
      | { type: 'text'; text: string }
      | { type: 'image'; data: string; mimeType: string }
  }>
  modelPreferences?: {
    hints?: { name?: string }[]
    costPriority?: number
    speedPriority?: number
    intelligencePriority?: number
  }
  systemPrompt?: string
  includeContext?: 'none' | 'thisServer' | 'allServers'
  temperature?: number
  maxTokens: number
  stopSequences?: string[]
  metadata?: Record<string, unknown>
}

export interface SamplingResult {
  model: string
  stopReason?: 'endTurn' | 'stopSequence' | 'maxTokens' | string
  role: 'user' | 'assistant'
  content:
    | { type: 'text'; text: string }
    | { type: 'image'; data: string; mimeType: string }
}

// Roots types (MCP)
export type Root = SDKRoot
export type RootList = Root[]
export type RootChangeNotification = SDKRootsListChangedNotification

// No additional interfaces are needed here, the main types come from the SDK.

// Resource template definition for dynamic resources
export interface ResourceTemplateDefinition {
  uriTemplate: string
  name: string
  description?: string
  mimeType?: string
  getContent: (params: Record<string, string>) => Promise<string> | string
}

export interface LoadedResource extends ResourceDefinition {
  content: string | (() => string | Promise<string>)
  paramsSchema?: ZodRawShape | ZodObject<any, any, any>
  complete?: (params: {
    argument: string
    partialInput: string
    context?: Record<string, unknown>
  }) => Promise<string[]> | string[]
  // Add more fields as needed for dynamic resources
}

export interface LoadedResourceTemplate extends ResourceTemplateDefinition {
  paramsSchema?: ZodRawShape | ZodObject<any, any, any>
  // Add more fields as needed for dynamic resource templates
}
