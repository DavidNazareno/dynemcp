// interfaces.ts
// Public types and interfaces for the DyneMCP API module
// ------------------------------------------------------

import { z } from 'zod'
// Import types from the SDK
import type {
  Tool as SDKTool,
  Resource as SDKResource,
  Prompt as SDKPrompt,
  SamplingMessage as SDKSamplingMessage,
  CallToolResult as SDKCallToolResult,
  Root as SDKRoot,
  RootsListChangedNotification as SDKRootsListChangedNotification,
} from '@modelcontextprotocol/sdk'

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

// Usar type alias si no hay extensión
export type ToolDefinition = SDKTool
export type ResourceDefinition = SDKResource
export type PromptDefinition = SDKPrompt

/**
 * Type utility for inferring types from Zod schemas.
 */
export type InferSchema<T> = T extends z.ZodType ? z.infer<T> : never

// Sampling types (MCP)
export type SamplingMessage = SDKSamplingMessage
// (No hay SamplingRequest/SamplingResult explícitos en el SDK)

// Roots types (MCP)
export type Root = SDKRoot
export type RootList = Root[]
export type RootChangeNotification = SDKRootsListChangedNotification

// No additional interfaces are needed aquí, los tipos principales vienen del SDK.
