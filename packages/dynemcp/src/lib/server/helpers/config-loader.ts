import fs from 'fs'
import { ConfigSchema } from '../schemas/config.js'
import type { DyneMCPConfig } from '../core/interfaces.js'
import { NETWORK, CLI, PATHS } from '../../../config.js'

export function loadConfigFromFile(configPath: string): Partial<DyneMCPConfig> {
  if (!fs.existsSync(configPath)) {
    return {}
  }

  try {
    const configFile = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return configFile
  } catch (error) {
    console.warn(`Failed to load config from ${configPath}:`, error)
    return {}
  }
}

export function loadConfigFromEnv(): Partial<DyneMCPConfig> {
  const config: Partial<DyneMCPConfig> = {}

  // Server configuration
  if (process.env.DYNEMCP_SERVER_NAME) {
    config.server = { name: process.env.DYNEMCP_SERVER_NAME, version: '1.0.0' }
  }
  if (process.env.DYNEMCP_SERVER_VERSION) {
    config.server = {
      name: 'dynemcp-server',
      version: process.env.DYNEMCP_SERVER_VERSION,
    }
  }

  // Component directories
  if (process.env.DYNEMCP_TOOLS_DIR) {
    config.tools = { enabled: true, directory: process.env.DYNEMCP_TOOLS_DIR }
  }
  if (process.env.DYNEMCP_RESOURCES_DIR) {
    config.resources = {
      enabled: true,
      directory: process.env.DYNEMCP_RESOURCES_DIR,
    }
  }
  if (process.env.DYNEMCP_PROMPTS_DIR) {
    config.prompts = {
      enabled: true,
      directory: process.env.DYNEMCP_PROMPTS_DIR,
    }
  }

  // Component patterns
  if (process.env.DYNEMCP_TOOLS_PATTERN) {
    config.tools = {
      enabled: true,
      directory: 'src/tools',
      pattern: process.env.DYNEMCP_TOOLS_PATTERN,
    }
  }
  if (process.env.DYNEMCP_RESOURCES_PATTERN) {
    config.resources = {
      enabled: true,
      directory: 'src/resources',
      pattern: process.env.DYNEMCP_RESOURCES_PATTERN,
    }
  }
  if (process.env.DYNEMCP_PROMPTS_PATTERN) {
    config.prompts = {
      enabled: true,
      directory: 'src/prompts',
      pattern: process.env.DYNEMCP_PROMPTS_PATTERN,
    }
  }

  // Component enabled flags
  if (process.env.DYNEMCP_TOOLS_ENABLED !== undefined) {
    config.tools = {
      enabled: process.env.DYNEMCP_TOOLS_ENABLED === 'true',
      directory: 'src/tools',
    }
  }
  if (process.env.DYNEMCP_RESOURCES_ENABLED !== undefined) {
    config.resources = {
      enabled: process.env.DYNEMCP_RESOURCES_ENABLED === 'true',
      directory: 'src/resources',
    }
  }
  if (process.env.DYNEMCP_PROMPTS_ENABLED !== undefined) {
    config.prompts = {
      enabled: process.env.DYNEMCP_PROMPTS_ENABLED === 'true',
      directory: 'src/prompts',
    }
  }

  // Logging configuration
  if (process.env.DYNEMCP_LOGGING_ENABLED !== undefined) {
    config.logging = {
      enabled: process.env.DYNEMCP_LOGGING_ENABLED === 'true',
      level: 'info',
      format: 'text',
      timestamp: true,
      colors: true,
    }
  }
  if (process.env.DYNEMCP_LOGGING_LEVEL) {
    config.logging = {
      enabled: true,
      level: process.env.DYNEMCP_LOGGING_LEVEL as any,
      format: 'text',
      timestamp: true,
      colors: true,
    }
  }
  if (process.env.DYNEMCP_LOGGING_FORMAT) {
    config.logging = {
      enabled: true,
      level: 'info',
      format: process.env.DYNEMCP_LOGGING_FORMAT as any,
      timestamp: true,
      colors: true,
    }
  }

  // Debug configuration
  if (process.env.DYNEMCP_DEBUG_ENABLED !== undefined) {
    config.debug = {
      enabled: process.env.DYNEMCP_DEBUG_ENABLED === 'true',
      verbose: false,
      showComponentDetails: false,
      showTransportDetails: false,
    }
  }
  if (process.env.DYNEMCP_DEBUG_VERBOSE !== undefined) {
    config.debug = {
      enabled: false,
      verbose: process.env.DYNEMCP_DEBUG_VERBOSE === 'true',
      showComponentDetails: false,
      showTransportDetails: false,
    }
  }

  // Performance configuration
  if (process.env.DYNEMCP_PERFORMANCE_MAX_CONCURRENT_REQUESTS) {
    config.performance = {
      maxConcurrentRequests: parseInt(
        process.env.DYNEMCP_PERFORMANCE_MAX_CONCURRENT_REQUESTS
      ),
      requestTimeout: 30000,
      memoryLimit: '512mb',
      enableMetrics: false,
    }
  }
  if (process.env.DYNEMCP_PERFORMANCE_REQUEST_TIMEOUT) {
    config.performance = {
      maxConcurrentRequests: 100,
      requestTimeout: parseInt(process.env.DYNEMCP_PERFORMANCE_REQUEST_TIMEOUT),
      memoryLimit: '512mb',
      enableMetrics: false,
    }
  }
  if (process.env.DYNEMCP_PERFORMANCE_MEMORY_LIMIT) {
    config.performance = {
      maxConcurrentRequests: 100,
      requestTimeout: 30000,
      memoryLimit: process.env.DYNEMCP_PERFORMANCE_MEMORY_LIMIT,
      enableMetrics: false,
    }
  }

  // Security configuration
  if (process.env.DYNEMCP_SECURITY_ENABLE_VALIDATION !== undefined) {
    config.security = {
      enableValidation:
        process.env.DYNEMCP_SECURITY_ENABLE_VALIDATION === 'true',
      strictMode: false,
      allowedOrigins: ['*'],
      rateLimit: { enabled: false, maxRequests: 100, windowMs: 900000 },
    }
  }
  if (process.env.DYNEMCP_SECURITY_STRICT_MODE !== undefined) {
    config.security = {
      enableValidation: true,
      strictMode: process.env.DYNEMCP_SECURITY_STRICT_MODE === 'true',
      allowedOrigins: ['*'],
      rateLimit: { enabled: false, maxRequests: 100, windowMs: 900000 },
    }
  }
  if (process.env.DYNEMCP_SECURITY_ALLOWED_ORIGINS) {
    config.security = {
      enableValidation: true,
      strictMode: false,
      allowedOrigins: process.env.DYNEMCP_SECURITY_ALLOWED_ORIGINS.split(','),
      rateLimit: { enabled: false, maxRequests: 100, windowMs: 900000 },
    }
  }

  // Transport configuration
  if (process.env.DYNEMCP_TRANSPORT_TYPE) {
    const transportType = process.env.DYNEMCP_TRANSPORT_TYPE as
      | 'stdio'
      | 'sse'
      | 'streamable-http'

    if (transportType === CLI.TRANSPORT_TYPES[0]) {
      // 'stdio'
      config.transport = { type: CLI.TRANSPORT_TYPES[0] }
    } else if (transportType === 'sse') {
      config.transport = {
        type: 'sse',
        options: {
          port: parseInt(
            process.env.DYNEMCP_SSE_PORT || String(NETWORK.DEFAULT_HTTP_PORT)
          ),
          endpoint: process.env.DYNEMCP_SSE_ENDPOINT || '/sse',
          messageEndpoint:
            process.env.DYNEMCP_SSE_MESSAGE_ENDPOINT || '/messages',
          cors: process.env.DYNEMCP_SSE_CORS_ALLOW_ORIGIN
            ? {
                allowOrigin: process.env.DYNEMCP_SSE_CORS_ALLOW_ORIGIN.includes(
                  ','
                )
                  ? process.env.DYNEMCP_SSE_CORS_ALLOW_ORIGIN.split(',')
                  : process.env.DYNEMCP_SSE_CORS_ALLOW_ORIGIN,
              }
            : undefined,
        },
      }
    } else if (transportType === CLI.TRANSPORT_TYPES[1]) {
      // 'streamable-http'
      config.transport = {
        type: CLI.TRANSPORT_TYPES[1],
        options: {
          port: parseInt(
            process.env.DYNEMCP_HTTP_PORT || String(NETWORK.DEFAULT_HTTP_PORT)
          ),
          endpoint:
            process.env.DYNEMCP_HTTP_ENDPOINT || NETWORK.DEFAULT_MCP_ENDPOINT,
          responseMode:
            (process.env.DYNEMCP_HTTP_RESPONSE_MODE as 'batch' | 'stream') ||
            'batch',
          batchTimeout: parseInt(
            process.env.DYNEMCP_HTTP_BATCH_TIMEOUT || '30000'
          ),
          maxMessageSize: process.env.DYNEMCP_HTTP_MAX_MESSAGE_SIZE || '4mb',
        },
      }
    }
  }

  return config
}

export function createDefaultConfig(): DyneMCPConfig {
  return {
    server: {
      name: 'dynemcp-server',
      version: '1.0.0',
    },
    tools: {
      enabled: true,
      directory: PATHS.TOOLS_DIR,
      pattern: PATHS.FILE_PATTERNS.TYPESCRIPT,
    },
    resources: {
      enabled: true,
      directory: PATHS.RESOURCES_DIR,
      pattern: PATHS.FILE_PATTERNS.TYPESCRIPT,
    },
    prompts: {
      enabled: true,
      directory: PATHS.PROMPTS_DIR,
      pattern: PATHS.FILE_PATTERNS.TYPESCRIPT,
    },
    transport: {
      type: CLI.TRANSPORT_TYPES[1], // 'streamable-http'
      options: {
        port: NETWORK.DEFAULT_HTTP_PORT,
        endpoint: NETWORK.DEFAULT_MCP_ENDPOINT,
      },
    },
    logging: {
      enabled: true,
      level: 'info',
      format: 'text',
      timestamp: true,
      colors: true,
    },
    debug: {
      enabled: false,
      verbose: false,
      showComponentDetails: false,
      showTransportDetails: false,
    },
    performance: {
      maxConcurrentRequests: 100,
      requestTimeout: 30000,
      memoryLimit: '512mb',
      enableMetrics: false,
    },
    security: {
      enableValidation: true,
      strictMode: false,
      allowedOrigins: ['*'],
      rateLimit: {
        enabled: false,
        maxRequests: 100,
        windowMs: 900000,
      },
    },
    config: {
      env: true,
    },
  }
}

export function mergeConfigs(
  defaultConfig: DyneMCPConfig,
  fileConfig: Partial<DyneMCPConfig>,
  envConfig: Partial<DyneMCPConfig>
): DyneMCPConfig {
  const merged = { ...defaultConfig, ...fileConfig, ...envConfig }

  // Build server property explicitly
  const server = {
    name: String(
      envConfig.server?.name ||
        fileConfig.server?.name ||
        defaultConfig.server.name
    ),
    version: String(
      envConfig.server?.version ||
        fileConfig.server?.version ||
        defaultConfig.server.version
    ),
  }

  // Build the final config object
  const finalConfig: DyneMCPConfig = Object.assign({}, merged, { server })

  return ConfigSchema.parse(finalConfig)
}

// TODO: Remove all any types
export function normalizeConfig(
  rawConfig: Record<string, unknown>
): DyneMCPConfig {
  // Handle backward compatibility for transport types
  if ((rawConfig as any).transport) {
    const transport = (rawConfig as any).transport
    if (transport.type === 'http-stream') {
      console.warn(
        '⚠️  Transport type "http-stream" is deprecated. ' +
          `Please update your configuration to use "${CLI.TRANSPORT_TYPES[1]}" instead.`
      )
      transport.type = CLI.TRANSPORT_TYPES[1]
    } else if (transport.type === 'http') {
      console.warn(
        '⚠️  Transport type "http" is deprecated. ' +
          `Please update your configuration to use "${CLI.TRANSPORT_TYPES[1]}" instead.`
      )
      transport.type = CLI.TRANSPORT_TYPES[1]
    }
  }

  const normalizedConfig: DyneMCPConfig = {
    server: {
      name: (rawConfig as any).server?.name || 'dynemcp-server',
      version: (rawConfig as any).server?.version || '1.0.0',
      description: (rawConfig as any).server?.description,
      documentationUrl: (rawConfig as any).server?.documentationUrl,
      environment: (rawConfig as any).server?.environment || 'development',
    },
    tools: {
      enabled: (rawConfig as any).tools?.enabled ?? true,
      directory: (rawConfig as any).tools?.directory || PATHS.TOOLS_DIR,
      pattern:
        (rawConfig as any).tools?.pattern || PATHS.FILE_PATTERNS.TYPESCRIPT,
      exclude: (rawConfig as any).tools?.exclude,
    },
    resources: {
      enabled: (rawConfig as any).resources?.enabled ?? true,
      directory: (rawConfig as any).resources?.directory || PATHS.RESOURCES_DIR,
      pattern:
        (rawConfig as any).resources?.pattern || PATHS.FILE_PATTERNS.TYPESCRIPT,
      exclude: (rawConfig as any).resources?.exclude,
    },
    prompts: {
      enabled: (rawConfig as any).prompts?.enabled ?? true,
      directory: (rawConfig as any).prompts?.directory || PATHS.PROMPTS_DIR,
      pattern:
        (rawConfig as any).prompts?.pattern || PATHS.FILE_PATTERNS.TYPESCRIPT,
      exclude: (rawConfig as any).prompts?.exclude,
    },
    transport: (rawConfig as any).transport || {
      type: CLI.TRANSPORT_TYPES[1], // 'streamable-http'
      options: {
        port: NETWORK.DEFAULT_HTTP_PORT,
        endpoint: NETWORK.DEFAULT_MCP_ENDPOINT,
      },
    },
    logging: (rawConfig as any).logging || {
      enabled: true,
      level: 'info',
      format: 'text',
      timestamp: true,
      colors: true,
    },
    debug: (rawConfig as any).debug || {
      enabled: false,
      verbose: false,
      showComponentDetails: false,
      showTransportDetails: false,
    },
    performance: (rawConfig as any).performance || {
      maxConcurrentRequests: 100,
      requestTimeout: 30000,
      memoryLimit: '512mb',
      enableMetrics: false,
    },
    security: (rawConfig as any).security || {
      enableValidation: true,
      strictMode: false,
      allowedOrigins: ['*'],
      rateLimit: {
        enabled: false,
        maxRequests: 100,
        windowMs: 900000,
      },
    },
    config: (rawConfig as any).config,
  }

  return normalizedConfig
}
