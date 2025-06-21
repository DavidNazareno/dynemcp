export interface ToolDefinition {
  name: string
  description: string
  schema: Record<string, any> // JSON Schema
  handler: (params: any) => Promise<any> | any
}

export interface ResourceDefinition {
  uri: string
  name: string
  content: string | (() => string | Promise<string>)
  description?: string
  contentType?: string
}

export interface PromptDefinition {
  id: string
  name: string
  content: string
  description?: string
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
