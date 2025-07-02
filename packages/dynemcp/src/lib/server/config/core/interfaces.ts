// Type definition for autoloaded configuration sections
export interface AutoloadConfig {
  enabled: boolean
  directory: string
  pattern?: string // Glob pattern for file matching
  exclude?: string | string[] // Files or patterns to exclude
}

// Type definition for the server configuration
export interface ServerConfig {
  name: string
  version: string
  description?: string
  documentationUrl?: string
  capabilities?: Record<string, any>
}

// Logging configuration
export interface LoggingConfig {
  enabled: boolean
  level: 'info' | 'warn' | 'error' | 'debug'
  format: 'text' | 'json'
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

// Config (env) configuration
export interface EnvConfig {
  env: boolean
}

// Main configuration interface for DyneMCP
export interface DyneMCPConfig {
  server: ServerConfig
  tools: AutoloadConfig
  resources: AutoloadConfig
  prompts: AutoloadConfig
  resourcesTemplates: AutoloadConfig
  transport: TransportConfig
  description?: string
  logging?: LoggingConfig
  debug?: DebugConfig
  performance?: PerformanceConfig
  security?: SecurityConfig
  config?: EnvConfig
}

// Type definition for Stdio transport configuration
export interface StdioTransportConfig {
  type: 'stdio'
  options?: Record<string, unknown>
}

// Type definition for Streamable HTTP transport configuration
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
    /**
     * Rate limiting options (see express-rate-limit)
     * Example:
     *   rateLimit: { windowMs: 900000, max: 100 }
     */
    rateLimit?: {
      windowMs?: number
      max?: number
      standardHeaders?: boolean
      legacyHeaders?: boolean
      message?: string | object
    }
  }
}

// Union type for all supported transport configurations
export type TransportConfig =
  | StdioTransportConfig
  | StreamableHTTPTransportConfig

// TODO: Resource template interfaces removed for production release. Re-implement in a future version if needed.
