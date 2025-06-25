// Import types from the official MCP SDK
import type {
  Prompt,
  PromptMessage,
  Resource,
  Tool,
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

// DyneMCP specific tool definition that extends MCP SDK Tool interface
export interface ToolDefinition extends Omit<Tool, 'inputSchema'> {
  /**
   * Tool name must be a string (enforced by framework)
   */
  name: string
  /**
   * Input schema using ZodRawShape format for convenience,
   * converted to JSON Schema when exposed to MCP clients
   */
  inputSchema?: ZodRawShape | Tool['inputSchema']
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
  exclude?: string | string[] // files/patterns to exclude
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
      allowOrigin?: string | string[]
      allowMethods?: string
      allowHeaders?: string
      exposeHeaders?: string
      maxAge?: number
    }
  }
}

export interface StreamableHTTPTransportConfig {
  type: 'streamable-http'
  options?: {
    port?: number
    host?: string
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
      allowOrigin?: string | string[]
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
  | StreamableHTTPTransportConfig

export interface ServerConfig {
  name: string
  version: string
  description?: string
  documentationUrl?: string
  environment?: string
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
