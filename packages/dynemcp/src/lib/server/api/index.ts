/**
 * DyneMCP Framework API Module
 *
 * This module provides all base classes, types, and utilities for defining tools, prompts, and resources
 * in the DyneMCP framework. It is the main API surface for framework extension and integration.
 *
 * Exports:
 * - TypeScript interfaces and type utilities for strong typing
 * - Base classes for tools, prompts, and resources
 * - Utility functions for schema, error handling, and responses
 */

// Type utilities and interfaces
export type { InferSchema } from './core/interfaces'
export type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  LoadedTool,
  LoadedPrompt,
  LoadedResource,
  LoadedResourceTemplate,
  PromptArgument,
  PromptMessage,
  CallToolResult,
  SamplingRequest,
  SamplingResult,
  ResourceTemplateDefinition,
  Root,
  RootList,
} from './core/interfaces'

// Utility functions
export {
  zodObjectToRawShape,
  createTextResponse,
  createErrorResponse,
  withErrorHandling,
} from './core/utils'

// Base classes and helpers
export { createTypedTool, tool } from './core/tool'
export { resource } from './core/resource'
export { prompt } from './core/prompt'

export * from './core/root'
export * from './auth'

// TODO: Resource template exports removed for production release. Re-implement in a future version if needed.
