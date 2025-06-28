import { z } from 'zod'
import { DEFAULT_SERVER_VERSION } from './defaults.js'
import { TransportSchema } from './transport.js'

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

// Main schema for full DyneMCP configuration
export const ConfigSchema = z.object({
  server: ServerConfigSchema,
  tools: AutoloadConfigSchema,
  resources: AutoloadConfigSchema,
  prompts: AutoloadConfigSchema,
  resourcesTemplates: AutoloadConfigSchema,
  transport: TransportSchema,
})

export type BaseConfig = z.infer<typeof BaseConfigSchema>
export type AutoloadConfig = z.infer<typeof AutoloadConfigSchema>
export type ServerConfig = z.infer<typeof ServerConfigSchema>
export type Config = z.infer<typeof ConfigSchema>
