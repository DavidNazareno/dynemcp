import { z } from 'zod'
import { DEFAULT_SERVER_VERSION } from './defaults'
import { TransportSchema } from './transport'

// Base schema for minimal configuration validation
export const BaseConfigSchema = z.object({
  server: z.object({
    name: z.string(),
    version: z.string(),
  }),
  description: z.string().optional(),
})

// Schema for autoload configuration
export const AutoloadConfigSchema = z.object({
  enabled: z.boolean().default(true),
  directory: z.string(),
  pattern: z.string().optional(),
  exclude: z.array(z.string()).optional(),
})

// Schema for server configuration
export const ServerConfigSchema = z.object({
  name: z.string().default('dynemcp-server'),
  version: z.string().default(DEFAULT_SERVER_VERSION),
  documentationUrl: z.string().url().optional(),
  description: z.string().optional(),
})

// Logging schema
export const LoggingConfigSchema = z.object({
  enabled: z.boolean(),
  level: z.enum(['info', 'warn', 'error', 'debug']),
  format: z.enum(['text', 'json']),
  timestamp: z.boolean(),
  colors: z.boolean(),
})

// Debug schema
export const DebugConfigSchema = z.object({
  enabled: z.boolean(),
  verbose: z.boolean(),
  showComponentDetails: z.boolean(),
  showTransportDetails: z.boolean(),
})

// Performance schema
export const PerformanceConfigSchema = z.object({
  maxConcurrentRequests: z.number(),
  requestTimeout: z.number(),
  memoryLimit: z.string(),
  enableMetrics: z.boolean(),
})

// Security schema
export const SecurityConfigSchema = z.object({
  enableValidation: z.boolean(),
  strictMode: z.boolean(),
  allowedOrigins: z.array(z.string()),
  rateLimit: z.object({
    enabled: z.boolean(),
    maxRequests: z.number(),
    windowMs: z.number(),
  }),
})

// Env config schema
export const EnvConfigSchema = z.object({
  env: z.boolean(),
})

// Main schema for full DyneMCP configuration
export const ConfigSchema = z.object({
  server: ServerConfigSchema,
  tools: AutoloadConfigSchema,
  resources: AutoloadConfigSchema,
  prompts: AutoloadConfigSchema,
  resourcesTemplates: AutoloadConfigSchema.optional(),
  transport: TransportSchema,
  description: z.string().optional(),
  logging: LoggingConfigSchema.optional(),
  debug: DebugConfigSchema.optional(),
  performance: PerformanceConfigSchema.optional(),
  security: SecurityConfigSchema.optional(),
  config: EnvConfigSchema.optional(),
})

export type BaseConfig = z.infer<typeof BaseConfigSchema>
export type AutoloadConfig = z.infer<typeof AutoloadConfigSchema>
export type ServerConfig = z.infer<typeof ServerConfigSchema>
export type Config = z.infer<typeof ConfigSchema>
