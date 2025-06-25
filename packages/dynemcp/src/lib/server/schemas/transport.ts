import { z } from 'zod'

export const CorsSchema = z.object({
  allowOrigin: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .default('*'),
  allowMethods: z.string().optional().default('GET, POST, OPTIONS'),
  allowHeaders: z
    .string()
    .optional()
    .default('Content-Type, Authorization, Mcp-Session-Id, Last-Event-ID'),
  exposeHeaders: z.string().optional().default('Content-Type, Mcp-Session-Id'),
  maxAge: z.number().optional().default(86400),
})

export const AuthMiddlewareSchema = z.object({
  path: z.string(),
})

export const SessionSchema = z.object({
  enabled: z.boolean().optional().default(true),
  headerName: z.string().optional().default('Mcp-Session-Id'),
  allowClientTermination: z.boolean().optional().default(true),
})

export const ResumabilitySchema = z.object({
  enabled: z.boolean().optional().default(false),
  historyDuration: z.number().optional().default(300000),
})

// Keeping SSE for backward compatibility, but it's deprecated
export const SSETransportOptionsSchema = z.object({
  port: z.number().optional().default(8080),
  endpoint: z.string().optional().default('/sse'),
  messageEndpoint: z.string().optional().default('/messages'),
  cors: CorsSchema.optional(),
})

export const StreamableHTTPTransportOptionsSchema = z.object({
  port: z.number().optional().default(8080),
  host: z.string().optional().default('localhost'),
  endpoint: z.string().optional().default('/mcp'),
  responseMode: z.enum(['batch', 'stream']).optional().default('batch'),
  batchTimeout: z.number().optional().default(30000),
  maxMessageSize: z.string().optional().default('4mb'),
  session: SessionSchema.optional(),
  resumability: ResumabilitySchema.optional(),
  cors: CorsSchema.optional(),
  authentication: AuthMiddlewareSchema.optional(),
})

// Updated to use official MCP SDK transport types
export const TransportSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('stdio') }),
  z.object({
    type: z.literal('streamable-http'),
    options: StreamableHTTPTransportOptionsSchema.optional(),
  }),
])

// Alias for backward compatibility
export const HTTPTransportOptionsSchema = StreamableHTTPTransportOptionsSchema
