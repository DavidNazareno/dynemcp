import { z, ZodRawShape } from 'zod'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  PromptArgument,
  PromptMessage,
  CallToolResult,
} from './interfaces.js'

// Type utilities for inference
export type InferSchema<T> = T extends z.ZodType ? z.infer<T> : never

/**
 * Helper function to convert Zod object schema to ZodRawShape
 */
export function zodObjectToRawShape<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T
): T['shape'] {
  return schema.shape
}

/**
 * Helper function to create a simple text response
 */
export function createTextResponse(text: string): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  }
}

/**
 * Helper function to create an error response
 */
export function createErrorResponse(error: string | Error): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: error instanceof Error ? error.message : error,
      },
    ],
    isError: true,
  }
}

/**
 * Helper function to wrap execution with proper error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => Promise<CallToolResult> {
  return async (...args: Parameters<T>) => {
    try {
      const result = await fn(...args)
      if (result && typeof result === 'object' && 'content' in result) {
        return result as CallToolResult
      }
      return createTextResponse(String(result))
    } catch (error: unknown) {
      return createErrorResponse(error as Error)
    }
  }
}

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
  // Add index signature to match the interface
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
   * Helper to create a successful result
   */
  protected createResult(content: unknown[]): CallToolResult {
    return {
      content: Array.isArray(content) ? content : ([content] as any),
    }
  }

  /**
   * Helper to create an error result
   */
  protected createErrorResult(error: string | Error): CallToolResult {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: error instanceof Error ? error.message : error,
        },
      ],
    }
  }

  /**
   * Helper to create text content
   */
  protected createTextContent(text: string): { type: 'text'; text: string } {
    return {
      type: 'text',
      text,
    }
  }

  /**
   * Helper to create simple text response
   */
  protected text(content: string): CallToolResult {
    return createTextResponse(content)
  }

  /**
   * Helper to create error response
   */
  protected error(error: string | Error): CallToolResult {
    return createErrorResponse(error)
  }

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

/**
 * Base class for all MCP Resources
 */
export abstract class DyneMCPResource implements ResourceDefinition {
  // Add index signature to match the interface
  [key: string]: unknown

  abstract readonly uri: string
  abstract readonly name: string
  abstract readonly description?: string
  abstract readonly mimeType?: string

  /**
   * Get the resource content
   */
  abstract getContent(): string | Promise<string>

  /**
   * Required by ResourceDefinition interface
   */
  get content(): string | (() => string | Promise<string>) {
    return this.getContent.bind(this)
  }

  /**
   * Required by ResourceDefinition interface
   */
  get contentType(): string | undefined {
    return this.mimeType
  }

  /**
   * Convert the resource to Resource format
   */
  toDefinition(): ResourceDefinition {
    return {
      uri: this.uri,
      name: this.name,
      content: this.getContent.bind(this),
      description: this.description,
      mimeType: this.mimeType,
      contentType: this.mimeType || 'application/octet-stream',
    }
  }
}

/**
 * Base class for all MCP Prompts
 */
export abstract class DyneMCPPrompt implements PromptDefinition {
  // Add index signature to match the interface
  [key: string]: unknown

  abstract readonly name: string
  abstract readonly description?: string
  abstract readonly arguments?: PromptArgument[]

  /**
   * Get the messages for this prompt
   * @param args The arguments passed to the prompt
   */
  abstract getMessages(args?: Record<string, string>): Promise<PromptMessage[]>

  /**
   * Helper to create a text message
   */
  protected createTextMessage(
    role: 'user' | 'assistant',
    text: string
  ): PromptMessage {
    return {
      role,
      content: {
        type: 'text',
        text,
      },
    } as PromptMessage
  }

  /**
   * Helper to create a resource message
   */
  protected createResourceMessage(
    role: 'user' | 'assistant',
    uri: string,
    text: string,
    mimeType?: string
  ): PromptMessage {
    return {
      role,
      content: {
        type: 'resource',
        resource: {
          uri,
          text,
          mimeType,
        },
      },
    } as PromptMessage
  }

  /**
   * Validate required arguments
   */
  protected validateArgs(args?: Record<string, string>): void {
    if (!this.arguments) return

    for (const arg of this.arguments) {
      if (arg.required && (!args || !args[arg.name])) {
        throw new Error(`Required argument '${arg.name}' is missing`)
      }
    }
  }

  /**
   * Convert the prompt to Prompt format
   */
  toDefinition(): PromptDefinition {
    return {
      name: this.name,
      description: this.description,
      arguments: this.arguments,
      getMessages: this.getMessages.bind(this),
    }
  }
}
