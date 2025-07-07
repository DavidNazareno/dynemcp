// Default values and settings for DyneMCP server configuration
// Provides defaults for server, transport, logging, performance, security, and autoloaded components.

import { PATHS } from '../../../../global/config-all-contants'
import type { DyneMCPConfig } from './interfaces'
import type { LoggingConfig } from './schemas'

// Default server name for DyneMCP
export const DEFAULT_SERVER_NAME = 'dynemcp-server'
// Default server version for DyneMCP
export const DEFAULT_SERVER_VERSION = '1.0.0'
// Default transport type for DyneMCP
// Default config file name
export const DEFAULT_CONFIG = 'dynemcp.config.ts'

// Default directories for autoloaded components
export const DEFAULT_TOOLS_DIR = './src/tools'
export const DEFAULT_RESOURCES_DIR = './src/resources'
export const DEFAULT_PROMPTS_DIR = './src/prompts'

// Default autoload configuration
export const DEFAULT_AUTOLOAD_CONFIG = {
  enabled: true,
  directory: '',
  pattern: PATHS.FILE_PATTERNS.TYPESCRIPT,
}

// Default logging configuration
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  enabled: true,
  level: 'info',
  format: 'json',
  timestamp: true,
  colors: true,
}

// Default debug configuration
export const DEFAULT_DEBUG_CONFIG = {
  enabled: false,
  verbose: false,
  showComponentDetails: false,
  showTransportDetails: false,
}

// Default performance configuration
export const DEFAULT_PERFORMANCE_CONFIG = {
  maxConcurrentRequests: 100,
  requestTimeout: 30000,
  memoryLimit: '512mb',
  enableMetrics: false,
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG = {
  enableValidation: true,
  strictMode: false,
  allowedOrigins: ['*'],
  rateLimit: {
    enabled: false,
    maxRequests: 100,
    windowMs: 900000,
  },
}

/**
 * createDefaultConfig: Creates a default DyneMCP configuration object.
 * @returns {DyneMCPConfig} The default configuration.
 */
export function createDefaultConfig(): DyneMCPConfig {
  return {
    server: {
      name: DEFAULT_SERVER_NAME,
      version: DEFAULT_SERVER_VERSION,
      // MCP capabilities: completions is mandatory according to the protocol and the SDK
      capabilities: {
        completions: {},
      },
    },
    tools: {
      ...DEFAULT_AUTOLOAD_CONFIG,
      directory: DEFAULT_TOOLS_DIR,
    },
    resources: {
      ...DEFAULT_AUTOLOAD_CONFIG,
      directory: DEFAULT_RESOURCES_DIR,
    },
    prompts: {
      ...DEFAULT_AUTOLOAD_CONFIG,
      directory: DEFAULT_PROMPTS_DIR,
    },
    transport: {
      type: 'stdio',
    },
    logging: DEFAULT_LOGGING_CONFIG,
    debug: DEFAULT_DEBUG_CONFIG,
    performance: DEFAULT_PERFORMANCE_CONFIG,
    security: DEFAULT_SECURITY_CONFIG,
  }
}

// TODO: Resource template defaults removed for production release. Re-implement in a future version if needed.
