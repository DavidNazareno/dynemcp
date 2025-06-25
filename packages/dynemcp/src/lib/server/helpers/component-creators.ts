import * as fs from 'fs'
import * as path from 'path'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  PromptMessage,
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
  schema: Record<string, any>,
  handler: (params: any) => any | Promise<any>
): ToolDefinition {
  return {
    name,
    description,
    schema,
    handler,
  }
}

// Resource helpers
export function createFileResource(
  filePath: string,
  options: FileResourceOptions = {}
): ResourceDefinition {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`)
  }

  const fileName = path.basename(absolutePath)
  const fileContent = fs.readFileSync(absolutePath, 'utf-8')

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
