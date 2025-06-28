import { NETWORK, CLI, PATHS } from '../../../../global/config-all-contants.js'
import { DyneMCPConfig } from './interfaces.js'

// Default server name for DyneMCP
export const DEFAULT_SERVER_NAME = 'dynemcp-server'
// Default server version for DyneMCP
export const DEFAULT_SERVER_VERSION = '1.0.0'
// Default transport type for DyneMCP
export const DEFAULT_TRANSPORT_TYPE = CLI.TRANSPORT_TYPES[1] // 'streamable-http'
// Default config file name
export const DEFAULT_CONFIG = 'dynemcp.config.ts'

// Default directories for autoloaded components
export const DEFAULT_TOOLS_DIR = './src/tools'
export const DEFAULT_RESOURCES_DIR = './src/resources'
export const DEFAULT_PROMPTS_DIR = './src/prompts'
export const DEFAULT_RESOURCES_TEMPLATE_DIR = './src/resources/templates'

// Default autoload configuration
export const DEFAULT_AUTOLOAD_CONFIG = {
  enabled: true,
  directory: '',
  pattern: PATHS.FILE_PATTERNS.TYPESCRIPT,
}

// Default transport options
export const DEFAULT_TRANSPORT_OPTIONS = {
  port: NETWORK.DEFAULT_HTTP_PORT,
  endpoint: NETWORK.DEFAULT_MCP_ENDPOINT,
}

/**
 * Creates a default DyneMCP configuration object.
 * @returns {DyneMCPConfig} The default configuration.
 */
export function createDefaultConfig(): DyneMCPConfig {
  return {
    server: {
      name: DEFAULT_SERVER_NAME,
      version: DEFAULT_SERVER_VERSION,
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
    resourcesTemplates: {
      ...DEFAULT_AUTOLOAD_CONFIG,
      directory: DEFAULT_RESOURCES_TEMPLATE_DIR,
    },
    transport: {
      type: DEFAULT_TRANSPORT_TYPE,
      options: DEFAULT_TRANSPORT_OPTIONS,
    },
  }
}
