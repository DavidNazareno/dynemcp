// Import types from the official MCP SDK
import type { Prompt, PromptMessage } from '@modelcontextprotocol/sdk/types.js'

// Re-export the official SDK types that we use
export type {
  PromptArgument,
  Prompt,
  PromptMessage,
  GetPromptRequest,
  GetPromptResult as GetPromptResponse,
  ListPromptsResult as ListPromptsResponse,
} from '@modelcontextprotocol/sdk/types.js'

export interface ToolDefinition {
  name: string
  description: string
  schema: any
  handler: (args: any) => any
}

export interface ResourceDefinition {
  name: string
  uri: string
  description?: string
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
