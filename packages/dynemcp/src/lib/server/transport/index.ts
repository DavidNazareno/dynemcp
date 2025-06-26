import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express from 'express'
import cors from 'cors'
import { TransportConfig } from '../core/interfaces.js'
import path from 'path'
import { randomUUID } from 'crypto'
import { NETWORK, CLI } from '../../../config.js'

// JSON-RPC 2.0 message types as per MCP specification
export interface JSONRPCRequest {
  jsonrpc: '2.0'
  id: number | string
  method: string
  params?: object
}

export interface JSONRPCResponse {
  jsonrpc: '2.0'
  id: number | string
  result?: object
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export interface JSONRPCNotification {
  jsonrpc: '2.0'
  method: string
  params?: object
}

export type JSONRPCMessage =
  | JSONRPCRequest
  | JSONRPCResponse
  | JSONRPCNotification

// Transport interface matching MCP SDK specifications
export interface Transport {
  // Start processing messages
  start(): Promise<void>

  // Send a JSON-RPC message
  send(message: JSONRPCMessage): Promise<void>

  // Close the connection
  close(): Promise<void>

  // Callbacks
  onclose?: () => void
  onerror?: (error: Error) => void
  onmessage?: (message: JSONRPCMessage) => void
}

// Legacy interface for backward compatibility
export interface LegacyTransport {
  connect(server: McpServer): Promise<void>
  disconnect?(): Promise<void>
}

/**
 * Standard Input/Output Transport
 * Uses stdio streams for communication, ideal for CLI tools and local integrations
 */
export class StdioTransport implements LegacyTransport {
  private transport?: StdioServerTransport

  async connect(server: McpServer): Promise<void> {
    this.transport = new StdioServerTransport()

    try {
      await server.connect(this.transport)
      // No logs in stdio mode to avoid contaminating output
    } catch (error) {
      throw new Error(`Failed to connect stdio transport: ${error}`)
    }
  }

  async disconnect(): Promise<void> {
    // Stdio transport doesn't need explicit cleanup
  }
}

/**
 * @deprecated SSE transport is deprecated as a standalone type.
 * Use StreamableHTTPTransport instead, which incorporates SSE as
 * part of its implementation for bidirectional communication.
 */
export class SSETransport implements LegacyTransport {
  constructor() {
    // Deprecated - will throw error on connect
  }

  async connect(): Promise<void> {
    console.warn(
      '⚠️  SSE transport is deprecated. ' +
        'Please use streamable-http transport instead, which incorporates SSE as ' +
        'part of its implementation for optimal compatibility.'
    )
    throw new Error(
      'SSE transport is deprecated as of protocol version 2024-11-05. ' +
        'Please use http-stream transport instead, which incorporates SSE as ' +
        'an optional streaming mechanism within the Streamable HTTP transport.'
    )
  }
}

/**
 * Streamable HTTP Transport
 * Uses HTTP POST requests for client-to-server communication and optional
 * Server-Sent Events (SSE) streams for server-to-client communication
 */
export class StreamableHTTPTransport implements LegacyTransport {
  private app: express.Express
  private port: number
  private endpoint: string
  private host: string
  private options: NonNullable<
    TransportConfig & { type: 'streamable-http' }
  >['options']
  private transport: StreamableHTTPServerTransport
  private server?: any
  private sessionStore = new Map<
    string,
    { id: string; created: Date; lastAccess: Date }
  >()

  constructor(
    options: NonNullable<
      TransportConfig & { type: 'streamable-http' }
    >['options'] = {}
  ) {
    this.app = express()
    this.setupMiddleware(options)

    this.port = options.port ?? NETWORK.DEFAULT_HTTP_PORT
    this.host = options.host ?? NETWORK.DEFAULT_HTTP_HOST
    this.endpoint = options.endpoint ?? NETWORK.DEFAULT_MCP_ENDPOINT
    this.options = options

    // Initialize with secure session ID generation
    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => this.generateSecureSessionId(),
    })
  }

  private setupMiddleware(options: Record<string, unknown>): void {
    // Security: Validate Origin headers to prevent DNS rebinding attacks
    const originMiddleware: express.RequestHandler = (req, res, next) => {
      const origin = req.headers.origin
      if (origin && !this.isOriginAllowed(origin)) {
        res.status(403).json({
          error: 'Forbidden: Origin not allowed',
          code: 'ORIGIN_NOT_ALLOWED',
        })
        return
      }
      next()
    }
    this.app.use(originMiddleware)

    // JSON parsing with size limits
    this.app.use(
      express.json({
        limit: (options as any).maxMessageSize ?? '4mb',
        verify: (req, res, buf) => {
          // Validate JSON-RPC structure
          if (buf.length > 0) {
            try {
              const body = JSON.parse(buf.toString())
              this.validateJSONRPCMessage(body)
            } catch (error) {
              throw new Error(`Invalid JSON-RPC message: ${error}`)
            }
          }
        },
      })
    )

    // CORS configuration
    if (options.cors) {
      this.app.use(
        cors({
          origin: (options as any).cors?.allowOrigin ?? '*',
          methods: (options as any).cors?.allowMethods ?? 'GET, POST, OPTIONS',
          allowedHeaders:
            (options as any).cors?.allowHeaders ??
            'Content-Type, Authorization, Mcp-Session-Id, Last-Event-ID',
          exposedHeaders:
            (options as any).cors?.exposeHeaders ??
            'Content-Type, Mcp-Session-Id',
          maxAge: (options as any).cors?.maxAge ?? 86400,
          credentials: true,
        })
      )
    }
  }

  private generateSecureSessionId(): string {
    return randomUUID()
  }

  private isOriginAllowed(origin: string): boolean {
    const allowedOrigins = this.options?.cors?.allowOrigin
    if (!allowedOrigins || allowedOrigins === '*') return true

    if (Array.isArray(allowedOrigins)) {
      return allowedOrigins.includes(origin)
    }

    return allowedOrigins === origin
  }

  private validateJSONRPCMessage(message: unknown): void {
    if (!message || typeof message !== 'object') {
      throw new Error('Message must be an object')
    }

    if ((message as any).jsonrpc !== '2.0') {
      throw new Error('Invalid JSON-RPC version, must be "2.0"')
    }

    if (!(message as any).method && (message as any).id === undefined) {
      throw new Error(
        'Message must have either method (for requests/notifications) or id (for responses)'
      )
    }
  }

  private handleSessionManagement(
    req: express.Request,
    res: express.Response
  ): string | null {
    if (!this.options?.session?.enabled) return null

    const sessionHeaderName =
      this.options.session.headerName ?? 'Mcp-Session-Id'
    let sessionId = req.headers[sessionHeaderName.toLowerCase()] as string

    // Handle initialization - create new session if needed
    if (req.body?.method === 'initialize' && !sessionId) {
      sessionId = this.generateSecureSessionId()
      res.setHeader(sessionHeaderName, sessionId)

      this.sessionStore.set(sessionId, {
        id: sessionId,
        created: new Date(),
        lastAccess: new Date(),
      })

      console.log(`🔐 New session created: ${sessionId}`)
    }

    // Validate existing session
    if (sessionId) {
      const session = this.sessionStore.get(sessionId)
      if (!session) {
        res.status(401).json({
          error: 'Invalid session ID',
          code: 'INVALID_SESSION',
        })
        return null
      }

      // Update last access time
      session.lastAccess = new Date()
      this.sessionStore.set(sessionId, session)
    }

    return sessionId
  }

  private handleSessionTermination(
    req: express.Request,
    res: express.Response
  ): boolean {
    if (!this.options?.session?.allowClientTermination) return false

    const sessionHeaderName =
      this.options.session.headerName ?? 'Mcp-Session-Id'
    const sessionId = req.headers[sessionHeaderName.toLowerCase()] as string

    if (req.method === 'DELETE' && sessionId) {
      this.sessionStore.delete(sessionId)
      res.status(204).send()
      console.log(`🗑️ Session terminated: ${sessionId}`)
      return true
    }

    return false
  }

  private async loadAuthenticationMiddleware(): Promise<express.RequestHandler> {
    if (!this.options?.authentication?.path) {
      return (req, res, next) => next()
    }

    try {
      const middlewarePath = path.resolve(this.options.authentication.path)
      const middlewareModule = await import(middlewarePath)

      if (typeof middlewareModule.default !== 'function') {
        throw new Error(
          'Authentication middleware must export a default function'
        )
      }

      console.log(`🔒 Authentication middleware loaded from ${middlewarePath}`)
      return middlewareModule.default
    } catch (error) {
      console.error('Failed to load authentication middleware:', error)
      throw error
    }
  }

  async connect(server: McpServer): Promise<void> {
    try {
      // Load authentication middleware
      const authMiddleware = await this.loadAuthenticationMiddleware()

      // Connect to MCP server
      await server.connect(this.transport)

      // Setup session termination endpoint
      this.app.delete(this.endpoint, (req, res) => {
        if (this.handleSessionTermination(req, res)) return
        res.status(404).json({ error: 'Session termination not enabled' })
      })

      // Setup main MCP endpoint for both POST and GET
      this.app.post(this.endpoint, authMiddleware, async (req, res) => {
        try {
          // Handle session management
          this.handleSessionManagement(req, res)
          if (res.headersSent) return // Session validation failed

          // Process the request through StreamableHTTPServerTransport
          // IMPORTANT: Pass req.body explicitly to avoid "stream is not readable" error
          await this.transport.handleRequest(req, res, req.body)
        } catch {
          console.error('Error handling MCP request')
          if (!res.headersSent) {
            res.status(500).json({
              error: 'Internal server error',
              code: 'INTERNAL_ERROR',
            })
          }
        }
      })

      // Support for server-initiated SSE streams (optional)
      this.app.get(this.endpoint, authMiddleware, async (req, res) => {
        try {
          // Set up SSE stream for server-to-client communication
          res.setHeader('Content-Type', 'text/event-stream')
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('Connection', 'keep-alive')

          // Handle Last-Event-ID for resumability
          const lastEventId = req.headers['last-event-id'] as string
          if (lastEventId && this.options?.resumability?.enabled) {
            // Implement message replay from disconnection point
            console.log(`📡 Resuming from event ID: ${lastEventId}`)
          }

          // Keep connection alive
          const keepAlive = setInterval(() => {
            if (!res.closed && !res.destroyed) {
              res.write(':\n\n') // SSE comment to keep connection alive
            } else {
              clearInterval(keepAlive)
            }
          }, 30000)

          // Clean up on multiple close events
          const cleanup = () => {
            clearInterval(keepAlive)
            console.log('🔌 SSE connection closed')
          }

          req.on('close', cleanup)
          req.on('aborted', cleanup)
          res.on('close', cleanup)
          res.on('finish', cleanup)
        } catch {
          console.error('Error handling SSE connection')
          if (!res.headersSent) {
            res.status(500).json({
              error: 'Internal server error',
              code: 'INTERNAL_ERROR',
            })
          }
        }
      })

      // Health check endpoint
      this.app.get('/health', (req, res) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          transport: CLI.TRANSPORT_TYPES[1], // 'streamable-http'
          sessions: this.sessionStore.size,
          uptime: process.uptime(),
        })
      })

      // Start the HTTP server
      this.server = this.app.listen(this.port, this.host, () => {
        console.log(
          `📡 Streamable HTTP transport listening on ${this.host}:${this.port}`
        )
        console.log(
          `🌐 MCP endpoint: http://${this.host}:${this.port}${this.endpoint}`
        )

        if (this.options?.session?.enabled) {
          console.log(`🔐 Session management enabled`)
        }

        if (this.options?.authentication?.path) {
          console.log(`🔒 Authentication enabled`)
        }

        if (this.options?.resumability?.enabled) {
          console.log(`📡 Resumability enabled`)
        }
      })

      // Setup graceful shutdown
      process.on('SIGTERM', () => this.disconnect())
      process.on('SIGINT', () => this.disconnect())
    } catch (error) {
      throw new Error(`Failed to start Streamable HTTP transport: ${error}`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.server) {
      console.log('🛑 Shutting down Streamable HTTP transport...')

      return new Promise((resolve) => {
        if (this.server) {
          this.server.close(() => {
            console.log('✅ Streamable HTTP transport stopped')
            resolve()
          })
        } else {
          resolve()
        }
      })
    }
  }
}

/**
 * Create transport instance based on configuration
 */
export function createTransport(config: TransportConfig): LegacyTransport {
  switch (config.type) {
    case CLI.TRANSPORT_TYPES[0]: // 'stdio'
      return new StdioTransport()

    case 'sse':
      return new SSETransport()

    case CLI.TRANSPORT_TYPES[1]: // 'streamable-http'
      return new StreamableHTTPTransport(config.options)

    default:
      throw new Error(`Unsupported transport type: ${(config as any).type}`)
  }
}

/**
 * Utility function to detect transport type for backwards compatibility
 */
export async function detectTransport(
  serverUrl: string
): Promise<'stdio' | 'streamable-http' | 'legacy-sse'> {
  try {
    // Try Streamable HTTP first
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'dynemcp-client',
            version: '1.0.0',
          },
        },
      }),
    })

    if (response.ok) {
      return CLI.TRANSPORT_TYPES[1] as 'streamable-http'
    }
  } catch {
    // Try legacy SSE detection
    try {
      const sseResponse = await fetch(serverUrl, {
        method: 'GET',
        headers: { Accept: 'text/event-stream' },
      })

      if (sseResponse.ok) {
        return 'legacy-sse'
      }
    } catch {
      // Fall back to stdio if network transports fail
      return CLI.TRANSPORT_TYPES[0] as 'stdio'
    }
  }

  throw new Error('Unable to detect compatible transport')
}
