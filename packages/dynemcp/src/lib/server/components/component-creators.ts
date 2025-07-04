// Component creator helpers for DyneMCP
// Provides factory functions for tools, resources, prompts, and resource templates.

import { readFileSync, existsSync } from 'fs'
import { isAbsolute, resolve, basename } from 'path'
import { type ZodRawShape, type ZodTypeAny } from 'zod'
import type { ZodObject } from 'zod'
import type {
  LoadedTool,
  LoadedPrompt,
  LoadedResource,
  LoadedResourceTemplate,
  PromptDefinition,
  PromptMessage,
  CallToolResult,
} from '../api'

/**
 * Options for creating a file-based resource.
 */
export interface FileResourceOptions {
  name?: string
  description?: string
  uri?: string
  contentType?: string
}

/**
 * Options for creating a dynamic resource.
 */
export interface DynamicResourceOptions {
  description?: string
  contentType?: string
}

/**
 * Options for creating a prompt.
 */
export interface PromptOptions {
  description?: string
}

/**
 * Chat message structure for chat prompts.
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * createTool: Helper to create a ToolDefinition for MCP servers.
 * Handles result normalization and error handling for tool execution.
 *
 * @param name - Tool name
 * @param description - Tool description
 * @param inputSchema - Zod schema for tool input
 * @param handler - Async/sync function to execute the tool
 * @param annotations - Optional MCP tool annotations
 */
export function createTool(
  name: string,
  description: string,
  inputSchema: ZodRawShape | ZodObject<any, any, any>,
  handler: (params: Record<string, unknown>) => unknown | Promise<unknown>,
  annotations?: Record<string, unknown>,
  outputSchema?: ZodRawShape | ZodObject<any, any, any>
): LoadedTool {
  return {
    name,
    description,
    inputSchema,
    outputSchema,
    annotations,
    async execute(args: Record<string, any>): Promise<CallToolResult> {
      try {
        const result = await handler(args)
        if (result && typeof result === 'object' && 'success' in result) {
          return result as CallToolResult
        }
        return {
          success: true,
          error: undefined,
          result: String(result),
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          result: undefined,
        }
      }
    },
    parameters: {}, // Optionally fill if needed
  }
}

/**
 * createFileResource: Helper to create a file-based ResourceDefinition for MCP servers.
 * Reads the file content at creation time.
 *
 * @param filePath - Path to the file
 * @param options - Optional resource metadata
 */
export function createFileResource(
  filePath: string,
  options: FileResourceOptions = {}
): LoadedResource {
  const absolutePath = isAbsolute(filePath)
    ? filePath
    : resolve(process.cwd(), filePath)

  if (!existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`)
  }

  const fileName = basename(absolutePath)
  const fileContent = readFileSync(absolutePath, 'utf-8')

  return {
    uri: options.uri || `file://${absolutePath}`,
    name: options.name || fileName,
    content: fileContent,
    description: options.description,
  }
}

/**
 * createDynamicResource: Helper to create a dynamic ResourceDefinition for MCP servers.
 * The content is generated on demand by the provided function.
 *
 * @param uri - Resource URI
 * @param name - Resource name
 * @param generator - Function that returns the resource content
 * @param options - Optional resource metadata
 */
export function createDynamicResource(
  uri: string,
  name: string,
  generator: () => string | Promise<string>,
  options: DynamicResourceOptions = {},
  paramsSchema?: ZodRawShape | ZodObject<any, any, any>
): LoadedResource {
  return {
    uri,
    name,
    content: generator,
    description: options.description,
    paramsSchema,
  }
}

/**
 * createPrompt: Helper to create a simple PromptDefinition for MCP servers.
 * Returns a single user message with the provided content.
 *
 * @param name - Prompt name
 * @param content - Prompt text
 * @param getMessages - Function to get prompt messages
 * @param argsSchema - Zod schema for prompt arguments
 * @param options - Optional prompt metadata
 */
export function createPrompt(
  name: string,
  content: string,
  getMessages: (args?: Record<string, string>) => Promise<PromptMessage[]>,
  argsSchema?: ZodRawShape | Record<string, ZodTypeAny>,
  options: PromptOptions = {}
): LoadedPrompt {
  return {
    name,
    description: options.description || name,
    getMessages,
    argsSchema,
  }
}

/**
 * createSystemPrompt: Helper to create a system prompt (alias for createPrompt).
 */
export function createSystemPrompt(
  name: string,
  content: string,
  getMessages: (args?: Record<string, string>) => Promise<PromptMessage[]>,
  argsSchema?: Record<string, any>,
  options: PromptOptions = {}
): PromptDefinition {
  return createPrompt(name, content, getMessages, argsSchema, options)
}

/**
 * createChatPrompt: Helper to create a chat-style PromptDefinition for MCP servers.
 * Accepts an array of chat messages (user/assistant) and returns them as prompt messages.
 *
 * @param name - Prompt name
 * @param messages - Array of chat messages
 * @param getMessages - Function to get prompt messages
 * @param argsSchema - Zod schema for prompt arguments
 * @param options - Optional prompt metadata
 */
export function createChatPrompt(
  name: string,
  messages: ChatMessage[],
  getMessages: (args?: Record<string, string>) => Promise<PromptMessage[]>,
  argsSchema?: Record<string, any>,
  options: PromptOptions = {}
): PromptDefinition {
  return createPrompt(name, '', getMessages, argsSchema, options)
}

/**
 * createResourceTemplate: Helper to create a resource template definition for dynamic resources.
 */
export function createResourceTemplate(
  uriTemplate: string,
  name: string,
  getContent: (params: Record<string, string>) => Promise<string> | string,
  options: { description?: string; mimeType?: string } = {},
  paramsSchema?: ZodRawShape | ZodObject<any, any, any>
): LoadedResourceTemplate {
  return {
    uriTemplate,
    name,
    getContent,
    description: options.description,
    mimeType: options.mimeType,
    paramsSchema,
  }
}
