import * as fs from 'fs'
import { ConfigSchema } from '../schemas/config.js'
import type { DyneMCPConfig } from '../core/interfaces.js'

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

    if (transportType === 'stdio') {
      config.transport = { type: 'stdio' }
    } else if (transportType === 'sse') {
      config.transport = {
        type: 'sse',
        options: {
          port: parseInt(process.env.DYNEMCP_SSE_PORT || '8080'),
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
    } else if (transportType === 'streamable-http') {
      config.transport = {
        type: 'streamable-http',
        options: {
          port: parseInt(process.env.DYNEMCP_HTTP_PORT || '8080'),
          endpoint: process.env.DYNEMCP_HTTP_ENDPOINT || '/mcp',
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
      directory: 'src/tools',
      pattern: '**/*.{ts,js}',
    },
    resources: {
      enabled: true,
      directory: 'src/resources',
      pattern: '**/*.{ts,js}',
    },
    prompts: {
      enabled: true,
      directory: 'src/prompts',
      pattern: '**/*.{ts,js}',
    },
    transport: {
      type: 'streamable-http',
      options: {
        port: 8080,
        endpoint: '/mcp',
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

export function normalizeConfig(rawConfig: any): DyneMCPConfig {
  // Handle backward compatibility for transport types
  if (rawConfig.transport) {
    if (rawConfig.transport.type === 'http-stream') {
      console.warn(
        '⚠️  Transport type "http-stream" is deprecated. ' +
          'Please update your configuration to use "streamable-http" instead.'
      )
      rawConfig.transport.type = 'streamable-http'
    } else if (rawConfig.transport.type === 'http') {
      console.warn(
        '⚠️  Transport type "http" is deprecated. ' +
          'Please update your configuration to use "streamable-http" instead.'
      )
      rawConfig.transport.type = 'streamable-http'
    }
  }

  const normalizedConfig: DyneMCPConfig = {
    server: {
      name: rawConfig.server?.name || 'dynemcp-server',
      version: rawConfig.server?.version || '1.0.0',
      description: rawConfig.server?.description,
      documentationUrl: rawConfig.server?.documentationUrl,
      environment: rawConfig.server?.environment || 'development',
    },
    tools: {
      enabled: rawConfig.tools?.enabled ?? true,
      directory: rawConfig.tools?.directory || './src/tools',
      pattern: rawConfig.tools?.pattern || '**/*.{ts,js}',
      exclude: rawConfig.tools?.exclude,
    },
    resources: {
      enabled: rawConfig.resources?.enabled ?? true,
      directory: rawConfig.resources?.directory || './src/resources',
      pattern: rawConfig.resources?.pattern || '**/*.{ts,js}',
      exclude: rawConfig.resources?.exclude,
    },
    prompts: {
      enabled: rawConfig.prompts?.enabled ?? true,
      directory: rawConfig.prompts?.directory || './src/prompts',
      pattern: rawConfig.prompts?.pattern || '**/*.{ts,js}',
      exclude: rawConfig.prompts?.exclude,
    },
    transport: rawConfig.transport || {
      type: 'streamable-http',
      options: {
        port: 8080,
        endpoint: '/mcp',
      },
    },
    logging: rawConfig.logging || {
      enabled: true,
      level: 'info',
      format: 'text',
      timestamp: true,
      colors: true,
    },
    debug: rawConfig.debug || {
      enabled: false,
      verbose: false,
      showComponentDetails: false,
      showTransportDetails: false,
    },
    performance: rawConfig.performance || {
      maxConcurrentRequests: 100,
      requestTimeout: 30000,
      memoryLimit: '512mb',
      enableMetrics: false,
    },
    security: rawConfig.security || {
      enableValidation: true,
      strictMode: false,
      allowedOrigins: ['*'],
      rateLimit: {
        enabled: false,
        maxRequests: 100,
        windowMs: 900000,
      },
    },
    config: rawConfig.config,
  }

  return normalizedConfig
}
