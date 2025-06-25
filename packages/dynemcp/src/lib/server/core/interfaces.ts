// Import types from the official MCP SDK
import type {
  Prompt,
  PromptMessage,
  Resource,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js'
import { ZodRawShape } from 'zod'

// Re-export the official SDK types that we use
export type {
  PromptArgument,
  Prompt,
  PromptMessage,
  GetPromptRequest,
  GetPromptResult as GetPromptResponse,
  ListPromptsResult as ListPromptsResponse,
  Resource,
  ResourceContents,
  ResourceTemplate,
  ReadResourceRequest,
  ReadResourceResult,
  ListResourcesResult,
  ListResourceTemplatesResult,
  Tool,
  CallToolResult,
  ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js'

// DyneMCP specific tool definition that aligns with MCP SDK
export interface ToolDefinition {
  name: string
  description?: string
  /**
   * Input schema using ZodRawShape format as expected by MCP SDK
   */
  inputSchema?: ZodRawShape
  annotations?: {
    title?: string
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
    openWorldHint?: boolean
  }
  /**
   * Function to execute the tool
   * @param args The arguments passed to the tool
   * @returns Promise resolving to tool execution result
   */
  execute: (args: any) => Promise<CallToolResult>
}

export interface ResourceDefinition extends Resource {
  /**
   * Function to generate the resource content
   * @returns Promise resolving to resource contents
   */
  content: string | (() => string | Promise<string>)
  contentType?: string
}

// Extend the official types for our framework needs
export interface PromptDefinition extends Prompt {
  /**
   * Function to generate messages for this prompt
   * @param args Arguments passed to the prompt
   * @returns Promise resolving to an array of prompt messages
   */
  getMessages: (args?: Record<string, string>) => Promise<PromptMessage[]>
}

export interface AutoloadConfig {
  enabled: boolean
  directory: string
  pattern?: string // glob pattern for file matching
}

// Logging configuration
export interface LoggingConfig {
  enabled: boolean
  level: 'error' | 'warn' | 'info' | 'debug'
  format: 'json' | 'text'
  timestamp: boolean
  colors: boolean
}

// Debug configuration
export interface DebugConfig {
  enabled: boolean
  verbose: boolean
  showComponentDetails: boolean
  showTransportDetails: boolean
}

// Performance configuration
export interface PerformanceConfig {
  maxConcurrentRequests: number
  requestTimeout: number
  memoryLimit: string
  enableMetrics: boolean
}

// Security configuration
export interface SecurityConfig {
  enableValidation: boolean
  strictMode: boolean
  allowedOrigins: string[]
  rateLimit: {
    enabled: boolean
    maxRequests: number
    windowMs: number
  }
}

// Transport interfaces
export interface StdioTransportConfig {
  type: 'stdio'
}

export interface SSETransportConfig {
  type: 'sse'
  options?: {
    port?: number
    endpoint?: string
    messageEndpoint?: string
    cors?: {
      allowOrigin?: string
      allowMethods?: string
      allowHeaders?: string
      exposeHeaders?: string
      maxAge?: number
    }
  }
}

export interface HTTPStreamTransportConfig {
  type: 'http-stream'
  options?: {
    port?: number
    endpoint?: string
    responseMode?: 'batch' | 'stream'
    batchTimeout?: number
    maxMessageSize?: string
    session?: {
      enabled?: boolean
      headerName?: string
      allowClientTermination?: boolean
    }
    resumability?: {
      enabled?: boolean
      historyDuration?: number
    }
    cors?: {
      allowOrigin?: string
      allowMethods?: string
      allowHeaders?: string
      exposeHeaders?: string
      maxAge?: number
    }
    authentication?: {
      path: string
    }
  }
}

export type TransportConfig =
  | StdioTransportConfig
  | SSETransportConfig
  | HTTPStreamTransportConfig

export interface ServerConfig {
  name: string
  version: string
  documentationUrl?: string
}

export interface DyneMCPConfig {
  server: ServerConfig
  tools: AutoloadConfig
  resources: AutoloadConfig
  prompts: AutoloadConfig
  transport?: TransportConfig
  logging?: LoggingConfig
  debug?: DebugConfig
  performance?: PerformanceConfig
  security?: SecurityConfig
  config?: {
    file?: string
    env?: boolean
  }
}
