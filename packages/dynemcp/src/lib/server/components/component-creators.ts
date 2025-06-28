import { readFileSync, existsSync } from 'fs'
import { isAbsolute, resolve, basename } from 'path'
import { z, ZodRawShape } from 'zod'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../api/core/interfaces.js'

// Inline type for a prompt message (MCP-compatible)
export interface PromptMessage {
  role: 'user' | 'assistant'
  content: {
    type: 'text'
    text: string
  }
}

// Inline type for a tool call result (MCP-compatible)
export interface CallToolResult {
  content: Array<{ type: 'text'; text: string }>
  isError?: boolean
}

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
 * Helper to create a ToolDefinition for MCP servers.
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
  inputSchema: Record<string, z.ZodTypeAny>,
  handler: (params: Record<string, unknown>) => unknown | Promise<unknown>,
  annotations?: {
    title?: string
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
    openWorldHint?: boolean
  }
): ToolDefinition {
  return {
    name,
    description,
    inputSchema: inputSchema as ZodRawShape,
    annotations,
    async execute(args: Record<string, any>): Promise<CallToolResult> {
      try {
        const result = await handler(args)
        if (result && typeof result === 'object' && 'content' in result) {
          return result as CallToolResult
        }
        return {
          content: [
            {
              type: 'text',
              text: String(result),
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: error instanceof Error ? error.message : String(error),
            },
          ],
        }
      }
    },
  }
}

/**
 * Helper to create a file-based ResourceDefinition for MCP servers.
 * Reads the file content at creation time.
 *
 * @param filePath - Path to the file
 * @param options - Optional resource metadata
 */
export function createFileResource(
  filePath: string,
  options: FileResourceOptions = {}
): ResourceDefinition {
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
    contentType: options.contentType || 'text/plain',
  }
}

/**
 * Helper to create a dynamic ResourceDefinition for MCP servers.
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
  options: DynamicResourceOptions = {}
): ResourceDefinition {
  return {
    uri,
    name,
    content: generator,
    description: options.description,
    contentType: options.contentType || 'application/octet-stream',
  }
}

/**
 * Helper to create a simple PromptDefinition for MCP servers.
 * Returns a single user message with the provided content.
 *
 * @param name - Prompt name
 * @param content - Prompt text
 * @param options - Optional prompt metadata
 */
export function createPrompt(
  name: string,
  content: string,
  options: PromptOptions = {}
): PromptDefinition {
  return {
    name,
    description: options.description || name,
    async getMessages(): Promise<PromptMessage[]> {
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: content,
          },
        },
      ]
    },
  }
}

/**
 * Helper to create a system prompt (alias for createPrompt).
 */
export function createSystemPrompt(
  name: string,
  content: string,
  options: PromptOptions = {}
): PromptDefinition {
  return createPrompt(name, content, options)
}

/**
 * Helper to create a chat-style PromptDefinition for MCP servers.
 * Accepts an array of chat messages (user/assistant) and returns them as prompt messages.
 *
 * @param name - Prompt name
 * @param messages - Array of chat messages
 * @param options - Optional prompt metadata
 */
export function createChatPrompt(
  name: string,
  messages: ChatMessage[],
  options: PromptOptions = {}
): PromptDefinition {
  return {
    name,
    description: options.description || name,
    async getMessages(): Promise<PromptMessage[]> {
      return messages.map(
        (message) =>
          ({
            role: message.role,
            content: {
              type: 'text',
              text: message.content,
            },
          }) as PromptMessage
      )
    },
  }
}
