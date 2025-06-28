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
export type { InferSchema } from './core/interfaces.js'
export type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  PromptArgument,
  PromptMessage,
  CallToolResult,
} from './core/interfaces.js'

// Utility functions
export {
  zodObjectToRawShape,
  createTextResponse,
  createErrorResponse,
  withErrorHandling,
} from './core/utils.js'

// Base classes and helpers
export { DyneMCPTool, createTypedTool } from './core/tool.js'
export { DyneMCPResource } from './core/resource.js'
export { DyneMCPPrompt } from './core/prompt.js'
