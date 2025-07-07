// Zod schemas for DyneMCP transport configuration
// Provides schemas for stdio, HTTP, SSE, and related transport options.

import { TRANSPORT } from '../../../../global/config-all-contants'
import { z } from 'zod'

// CorsSchema: CORS options for HTTP/SSE transports
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

// AuthMiddlewareSchema: Authentication middleware options
export const AuthMiddlewareSchema = z.object({
  path: z.string(),
})

// SessionSchema: Session options for HTTP transport
export const SessionSchema = z.object({
  enabled: z.boolean().optional().default(true),
  headerName: z.string().optional().default('Mcp-Session-Id'),
  allowClientTermination: z.boolean().optional().default(true),
})

// ResumabilitySchema: Resumability options for HTTP transport
export const ResumabilitySchema = z.object({
  enabled: z.boolean().optional().default(false),
  historyDuration: z.number().optional().default(300000),
})

// StdioTransportOptionsSchema: Options for stdio transport
export const StdioTransportOptionsSchema = z.object({})

// StreamableHTTPTransportOptionsSchema: Options for HTTP transport
export const StreamableHTTPTransportOptionsSchema = z.object({
  mode: z
    .enum(['streamable-http', 'sse'])
    .optional()
    .default('streamable-http'),
  port: z
    .number()
    .optional()
    .default(TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.port),
  host: z
    .string()
    .optional()
    .default(TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.host),
  endpoint: z
    .string()
    .optional()
    .default(TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.endpoint),
  responseMode: z.enum(['batch', 'stream']).optional().default('batch'),
  batchTimeout: z.number().optional().default(30000),
  maxMessageSize: z.string().optional().default('4mb'),
  session: SessionSchema.optional(),
  resumability: ResumabilitySchema.optional(),
  cors: CorsSchema.optional(),
  authentication: AuthMiddlewareSchema.optional(),
})

// TransportSchema: Discriminated union for all supported transport types
export const TransportSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('stdio'),
    options: StdioTransportOptionsSchema.optional(),
  }),
  z.object({
    type: z.literal('http'),
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
export type StdioTransportOptions = z.infer<typeof StdioTransportOptionsSchema>
export type TransportConfig = z.infer<typeof TransportSchema>
