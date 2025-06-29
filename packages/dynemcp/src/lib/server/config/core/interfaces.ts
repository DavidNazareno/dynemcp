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
}

// Main configuration interface for DyneMCP
export interface DyneMCPConfig {
  server: ServerConfig
  tools: AutoloadConfig
  resources: AutoloadConfig
  prompts: AutoloadConfig
  resourcesTemplates: AutoloadConfig
  transport: TransportConfig
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
  }
}

// Union type for all supported transport configurations
export type TransportConfig =
  | StdioTransportConfig
  | StreamableHTTPTransportConfig
