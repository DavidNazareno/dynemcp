// Type definitions and interfaces for DyneMCP server configuration
// Defines all config sections: autoload, server, logging, debug, performance, security, transport, and main config.

import type {
  AutoloadConfig,
  ServerConfig,
  LoggingConfig,
  DebugConfig,
  PerformanceConfig,
  SecurityConfig,
} from './schemas'
import type {
  StreamableHTTPTransportOptions,
  TransportConfig as ZodTransportConfig,
} from './transport'

export type StdioTransportConfig = {
  type: 'stdio'
}
export type StreamableHTTPTransportConfig = {
  type: 'http'
  options?: StreamableHTTPTransportOptions
}
export type TransportConfig = ZodTransportConfig

export type DyneMCPConfig = {
  server: ServerConfig
  tools: AutoloadConfig
  resources: AutoloadConfig
  prompts: AutoloadConfig
  transport: TransportConfig
  description?: string
  logging?: LoggingConfig
  debug?: DebugConfig
  performance?: PerformanceConfig
  security?: SecurityConfig
}

// TODO: Resource template interfaces removed for production release. Re-implement in a future version if needed.
