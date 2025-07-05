// Zod schemas for DyneMCP server configuration validation
// Provides schemas for all config sections: server, autoload, logging, debug, performance, security, env, and main config.

import { z } from 'zod'
import { DEFAULT_SERVER_VERSION } from './defaults'
import { TransportSchema } from './transport'

// BaseConfigSchema: Minimal configuration validation
export const BaseConfigSchema = z.object({
  server: z.object({
    name: z.string(),
    version: z.string(),
  }),
  description: z.string().optional(),
})

// AutoloadConfigSchema: Validation for autoloaded component directories
export const AutoloadConfigSchema = z.object({
  enabled: z.boolean().default(true),
  directory: z.string(),
  pattern: z.string().optional(),
  exclude: z.array(z.string()).optional(),
})

// ServerConfigSchema: Validation for server config
export const ServerConfigSchema = z.object({
  name: z.string().default('dynemcp-server'),
  version: z.string().default(DEFAULT_SERVER_VERSION),
  documentationUrl: z.string().url().optional(),
  description: z.string().optional(),
})

// LoggingConfigSchema: Validation for logging config
export const LoggingConfigSchema = z.object({
  enabled: z.boolean(),
  level: z.enum(['info', 'warn', 'error', 'debug']),
  format: z.enum(['text', 'json']),
  timestamp: z.boolean(),
  colors: z.boolean(),
})

// DebugConfigSchema: Validation for debug config
export const DebugConfigSchema = z.object({
  enabled: z.boolean(),
  verbose: z.boolean(),
  showComponentDetails: z.boolean(),
  showTransportDetails: z.boolean(),
})

// PerformanceConfigSchema: Validation for performance config
export const PerformanceConfigSchema = z.object({
  maxConcurrentRequests: z.number(),
  requestTimeout: z.number(),
  memoryLimit: z.string(),
  enableMetrics: z.boolean(),
})

// SecurityConfigSchema: Validation for security config
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

// ConfigSchema: Main schema for full DyneMCP configuration
export const ConfigSchema = z.object({
  server: ServerConfigSchema,
  tools: AutoloadConfigSchema,
  resources: AutoloadConfigSchema,
  prompts: AutoloadConfigSchema,
  transport: TransportSchema,
  description: z.string().optional(),
  logging: LoggingConfigSchema.optional(),
  debug: DebugConfigSchema.optional(),
  performance: PerformanceConfigSchema.optional(),
  security: SecurityConfigSchema.optional(),
})

export type BaseConfig = z.infer<typeof BaseConfigSchema>
export type AutoloadConfig = z.infer<typeof AutoloadConfigSchema>
export type ServerConfig = z.infer<typeof ServerConfigSchema>
export type Config = z.infer<typeof ConfigSchema>

// TODO: Resource template schemas removed for production release. Re-implement in a future version if needed.
