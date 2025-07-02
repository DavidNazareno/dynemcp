// Zod schemas for DyneMCP transport configuration validation
// Provides schemas for stdio and HTTP transport config options.

import { z } from 'zod'

// StdioTransportConfigSchema: Schema for stdio transport configuration
export const StdioTransportConfigSchema = z.object({
  type: z.literal('stdio'),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
})

// HTTPTransportConfigSchema: Schema for streamable HTTP transport configuration
export const HTTPTransportConfigSchema = z.object({
  type: z.literal('streamable-http'),
  url: z.string().url(),
  sessionId: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
})

// TransportConfigSchema: Discriminated union schema for all supported transport configs
export const TransportConfigSchema = z.discriminatedUnion('type', [
  StdioTransportConfigSchema,
  HTTPTransportConfigSchema,
])
