import { z } from 'zod';
import { SERVER_VERSION } from '../core/constants.js';
import { TransportSchema } from './transport.js';

export const AutoloadConfigSchema = z.object({
  enabled: z.boolean().default(true),
  directory: z.string(),
  pattern: z.string().optional(),
});

export const ServerConfigSchema = z.object({
  name: z.string().default('dynemcp-server'),
  version: z.string().default(SERVER_VERSION),
});

export const LoggingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  format: z.enum(['json', 'text']).default('text'),
  timestamp: z.boolean().default(true),
  colors: z.boolean().default(true),
});

export const DebugConfigSchema = z.object({
  enabled: z.boolean().default(false),
  verbose: z.boolean().default(false),
  showComponentDetails: z.boolean().default(false),
  showTransportDetails: z.boolean().default(false),
});

export const PerformanceConfigSchema = z.object({
  maxConcurrentRequests: z.number().default(100),
  requestTimeout: z.number().default(30000),
  memoryLimit: z.string().default('512mb'),
  enableMetrics: z.boolean().default(false),
});

export const SecurityConfigSchema = z.object({
  enableValidation: z.boolean().default(true),
  strictMode: z.boolean().default(false),
  allowedOrigins: z.array(z.string()).default(['*']),
  rateLimit: z.object({
    enabled: z.boolean().default(false),
    maxRequests: z.number().default(100),
    windowMs: z.number().default(900000), // 15 minutes
  }).default({}),
});

export const ConfigOptionsSchema = z.object({
  file: z.string().optional(),
  env: z.boolean().default(true),
});

export const ConfigSchema = z.object({
  server: ServerConfigSchema,
  tools: AutoloadConfigSchema,
  resources: AutoloadConfigSchema,
  prompts: AutoloadConfigSchema,
  transport: TransportSchema.optional(),
  logging: LoggingConfigSchema.optional(),
  debug: DebugConfigSchema.optional(),
  performance: PerformanceConfigSchema.optional(),
  security: SecurityConfigSchema.optional(),
  config: ConfigOptionsSchema.optional(),
}); 