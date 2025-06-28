import { readFileSync, existsSync } from 'fs'
import { isAbsolute, resolve, basename } from 'path'
import { z, ZodRawShape } from 'zod'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  PromptMessage,
  CallToolResult,
} from '../core/interfaces.js'

export interface FileResourceOptions {
  name?: string
  description?: string
  uri?: string
  contentType?: string
}

export interface DynamicResourceOptions {
  description?: string
  contentType?: string
}

export interface PromptOptions {
  description?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Tool helpers
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

// Resource helpers
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

// Prompt helpers
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
        } as PromptMessage,
      ]
    },
  }
}

export function createSystemPrompt(
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
        } as PromptMessage,
      ]
    },
  }
}

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
