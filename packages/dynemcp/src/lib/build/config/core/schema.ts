// core/schema.ts
// Zod schema for DyneMCP configuration
// ------------------------------------
//
// - Defines the Zod schema for validating DyneMCP configuration files.
// - Ensures type safety and default values for all config options.
// - Used by config loader to validate user and default configs.

import { z } from 'zod'

export const DyneMCPConfigSchema = z.object({
  server: z.object({
    name: z.string(),
    version: z.string(),
  }),
  description: z.string().optional(),
  tools: z.object({
    enabled: z.boolean().default(true),
    directory: z.string().default('./src/tools'),
    pattern: z.string().default('**/*.{ts,js}'),
  }),
  resources: z.object({
    enabled: z.boolean().default(true),
    directory: z.string().default('./src/resources'),
    pattern: z.string().default('**/*.{ts,js}'),
  }),
  prompts: z.object({
    enabled: z.boolean().default(true),
    directory: z.string().default('./src/prompts'),
    pattern: z.string().default('**/*.{ts,js}'),
  }),
  transport: z
    .object({
      type: z.enum(['stdio', 'streamable-http']).default('stdio'),
      options: z.record(z.any()).optional(),
    })
    .optional(),
  logging: z
    .object({
      enabled: z.boolean().default(true),
      level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
      format: z.enum(['text', 'json']).default('text'),
      timestamp: z.boolean().default(true),
      colors: z.boolean().default(true),
    })
    .optional(),
  debug: z
    .object({
      enabled: z.boolean().default(false),
      verbose: z.boolean().default(false),
      showComponentDetails: z.boolean().default(false),
      showTransportDetails: z.boolean().default(false),
    })
    .optional(),
  performance: z
    .object({
      maxConcurrentRequests: z.number().default(100),
      requestTimeout: z.number().default(30000),
      memoryLimit: z.string().default('512mb'),
      enableMetrics: z.boolean().default(false),
    })
    .optional(),
  security: z
    .object({
      enableValidation: z.boolean().default(true),
      strictMode: z.boolean().default(false),
      allowedOrigins: z.array(z.string()).default(['*']),
      rateLimit: z
        .object({
          enabled: z.boolean().default(false),
          maxRequests: z.number().default(100),
          windowMs: z.number().default(900000),
        })
        .optional(),
    })
    .optional(),
  config: z
    .object({
      env: z.boolean().default(true),
    })
    .optional(),
})
