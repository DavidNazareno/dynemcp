import { z } from 'zod'
import { NETWORK } from '../../../../global/config-all-contants.js'

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

export const StreamableHTTPTransportOptionsSchema = z.object({
  port: z.number().optional().default(NETWORK.DEFAULT_HTTP_PORT),
  host: z.string().optional().default(NETWORK.DEFAULT_HTTP_HOST),
  endpoint: z.string().optional().default(NETWORK.DEFAULT_MCP_ENDPOINT),
  responseMode: z.enum(['batch', 'stream']).optional().default('batch'),
  batchTimeout: z.number().optional().default(30000),
  maxMessageSize: z.string().optional().default('4mb'),
  session: SessionSchema.optional(),
  resumability: ResumabilitySchema.optional(),
  cors: CorsSchema.optional(),
  authentication: AuthMiddlewareSchema.optional(),
})

export const SSETransportOptionsSchema = z.object({
  port: z.number().optional().default(NETWORK.DEFAULT_HTTP_PORT),
  endpoint: z.string().optional().default(NETWORK.DEFAULT_MCP_ENDPOINT),
  messageEndpoint: z.string().optional().default('/message'),
  cors: CorsSchema.optional(),
})

export const TransportSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('sse'),
    options: SSETransportOptionsSchema.optional(),
  }),
  z.object({
    type: z.literal('streamable-http'),
    options: StreamableHTTPTransportOptionsSchema.optional(),
  }),
])

// Export types derived from schemas
export type Cors = z.infer<typeof CorsSchema>
export type AuthMiddleware = z.infer<typeof AuthMiddlewareSchema>
export type Session = z.infer<typeof SessionSchema>
export type Resumability = z.infer<typeof ResumabilitySchema>
export type StreamableHTTPTransportOptions = z.infer<
  typeof StreamableHTTPTransportOptionsSchema
>
export type SSETransportOptions = z.infer<typeof SSETransportOptionsSchema>
export type TransportConfig = z.infer<typeof TransportSchema>
