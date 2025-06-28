import { z } from 'zod'

// Zod schema for stdio transport configuration
export const StdioTransportConfigSchema = z.object({
  type: z.literal('stdio'),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
})

// Zod schema for streamable HTTP transport configuration
export const HTTPTransportConfigSchema = z.object({
  type: z.literal('streamable-http'),
  url: z.string().url(),
  sessionId: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
})

// Discriminated union schema for all supported transport configs
export const TransportConfigSchema = z.discriminatedUnion('type', [
  StdioTransportConfigSchema,
  HTTPTransportConfigSchema,
])
