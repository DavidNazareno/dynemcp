import express, { type Express, type RequestHandler } from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js'
import { TransportError } from '../core/errors'
import { isJSONRPCNotification } from '../core/jsonrpc'
import { parseRootList } from '../../api/core/root'
import {
  handleSessionManagement,
  handleSessionTermination,
} from './core/session'
import { setupMiddleware } from './core/middleware'
import { generateSecureSessionId } from './core/utils'
import { registry } from '../../registry/core/registry'
import { TRANSPORT } from '../../../../global/config-all-contants'
import type { MessageExtraInfo } from '@modelcontextprotocol/sdk/types.js'
import type { TransportSendOptions } from '@modelcontextprotocol/sdk/shared/transport.js'
import { fileLogger } from '../../../../global/logger'

export class HTTPServers {
  private app: Express
  private port: number
  private endpoint: string
  private host: string
  private options: any
  private transport: StreamableHTTPServerTransport
  private server?: ReturnType<Express['listen']>
  private sessionStore = new Map<
    string,
    { id: string; created: Date; lastAccess: Date }
  >()
  private sessionRoots = new Map<string, any>()
  // Solo para modo SSE
  private sseClients: Set<{ res: express.Response; sessionId: string | null }> =
    new Set()

  // Eventos Transport
  onclose?: () => void
  onerror?: (error: Error) => void
  onmessage?: (message: JSONRPCMessage, extra?: MessageExtraInfo) => void
  setProtocolVersion?: (version: string) => void
  sessionId?: string // Opcional, para cumplir con Transport

  constructor(options: any = {}) {
    this.options = options
    this.app = express()
    setupMiddleware(this.app, this.options)

    this.port =
      this.options.port ?? TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.port
    this.host =
      this.options.host ?? TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.host
    this.endpoint =
      this.options.endpoint ?? TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.endpoint
    this.options.mode = this.options.mode ?? 'streamable-http'

    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => generateSecureSessionId(),
    })
  }

  /**
   * Standard Transport method. Initializes the Express server and endpoints.
   * Alias of connect(), but without arguments (does not require McpServer).
   */
  async start(): Promise<void> {
    // If already running, do nothing
    if (this.server) return
    // For compatibility, initialize endpoints with a dummy McpServer if necessary
    // Or simply initialize the endpoints and the Express server
    await this.connect(
      new McpServer({ name: 'dynemcp-server', version: '1.0.0' })
    )
  }

  async connect(server: McpServer): Promise<void> {
    try {
      // Authentication middleware
      const middlewarePath = registry.getAuthenticationMiddlewarePath()
      let userAuthMiddleware: RequestHandler
      if (!middlewarePath) {
        userAuthMiddleware = (req, res, next) => next()
      } else if (typeof middlewarePath === 'string') {
        userAuthMiddleware = (await import(middlewarePath)).default
      } else if (typeof middlewarePath.middleware === 'function') {
        userAuthMiddleware = middlewarePath.middleware
      } else {
        // Fallback
        userAuthMiddleware = (req, res, next) => next()
      }

      await server.connect(this.transport)

      // Endpoint selection according to mode
      if (this.options.mode === 'sse') {
        this.setupSseEndpoints(userAuthMiddleware)
      } else {
        this.setupMcpEndpoints(userAuthMiddleware)
      }

      this.server = this.app.listen(this.port, this.host, () => {
        fileLogger.info(`📡 HTTPServers listening on ${this.host}:${this.port}`)
        if (this.options.mode === 'sse') {
          fileLogger.info('🌐 SSE MCP endpoints enabled: /sse, /messages')
        } else {
          fileLogger.info(
            `🌐 MCP endpoint: http://${this.host}:${this.port}${this.endpoint}`
          )
        }
        if (this.options?.session?.enabled)
          fileLogger.info('🔐 Session management enabled')
        if (this.options?.authentication?.path)
          fileLogger.info('🔒 Authentication enabled')
        if (this.options?.resumability?.enabled)
          fileLogger.info('📡 Resumability enabled')
      })

      process.on('SIGTERM', () => this.disconnect())
      process.on('SIGINT', () => this.disconnect())
    } catch (error) {
      throw TransportError.connectionError(
        `Failed to start HTTPServers: ${error}`
      )
    }
  }

  // --- HTTP MCP MODE ---
  private setupMcpEndpoints(authMiddleware: RequestHandler) {
    // Session termination endpoint
    this.app.delete(this.endpoint, (req, res) => {
      if (
        !handleSessionTermination(req, res, this.options, this.sessionStore)
      ) {
        res.status(404).json({ error: 'Session termination not enabled' })
      }
    })

    // Main MCP POST endpoint
    this.app.post(this.endpoint, authMiddleware, async (req, res) => {
      if (res.headersSent) return
      try {
        const sessionId = handleSessionManagement(
          req,
          res,
          this.options,
          this.sessionStore,
          generateSecureSessionId
        )
        if (res.headersSent) return

        // Handle roots/didChange notification
        if (
          isJSONRPCNotification(req.body) &&
          req.body.method === 'roots/didChange'
        ) {
          if (sessionId) {
            const roots = parseRootList(req.body.params)
            this.sessionRoots.set(sessionId, roots)
            res.status(200).json({ result: 'Roots updated', roots })
            fileLogger.info(
              `🌱 Roots updated for session ${sessionId}: ${roots}`
            )
          } else {
            res
              .status(400)
              .json({ error: 'Session required for roots/didChange' })
          }
          return
        }

        // Pass request to StreamableHTTPServerTransport
        await this.transport.handleRequest(req as any, res as any, req.body)
      } catch (err) {
        if (!res.headersSent) {
          res.set(
            'WWW-Authenticate',
            `Bearer resource_metadata="https://${this.host}:${this.port}/.well-known/oauth-protected-resource"`
          )
          res.status(401).json({ error: 'Unauthorized ' + err })
        }
      }
    })

    // MCP GET endpoint (SSE-like, no Inspector)
    this.app.get(this.endpoint, authMiddleware, async (req, res) => {
      try {
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        const lastEventId = req.headers['last-event-id'] as string | undefined
        if (lastEventId && this.options?.resumability?.enabled) {
          fileLogger.info(`📡 Resuming from event ID: ${lastEventId}`)
          // Implement replay logic if needed
        }

        const keepAlive = setInterval(() => {
          if (!res.writableEnded) {
            res.write(':\n\n') // SSE comment
          } else {
            clearInterval(keepAlive)
          }
        }, 30000)

        const cleanup = () => {
          clearInterval(keepAlive)
          fileLogger.info('🔌 SSE connection closed')
        }

        req.on('close', cleanup)
        req.on('aborted', cleanup)
        res.on('close', cleanup)
        res.on('finish', cleanup)
      } catch (error) {
        console.error('Error handling SSE connection', error)
        if (!res.headersSent) {
          res
            .status(500)
            .json({ error: 'Internal server error', code: 'INTERNAL_ERROR' })
        }
      }
    })

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        transport: 'streamable-http',
        sessions: this.sessionStore.size,
        uptime: process.uptime(),
      })
    })
  }

  // --- SSE/INSPECTOR MODE ---
  private setupSseEndpoints(authMiddleware: RequestHandler) {
    // SSE endpoint for MCP Inspector
    this.app.get('/sse', authMiddleware, (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.flushHeaders?.()

      // Session management (optional)
      let sessionId: string | null = null
      try {
        sessionId = handleSessionManagement(
          req,
          res,
          this.options,
          this.sessionStore,
          generateSecureSessionId
        )
      } catch {
        // Ignore session errors for SSE
      }

      const client = { res, sessionId }
      this.sseClients.add(client)
      fileLogger.info(
        `🔗 SSE client connected (${this.sseClients.size} total)${sessionId ? `, session: ${sessionId}` : ''}`
      )

      // Keepalive
      const keepAlive = setInterval(() => {
        if (!res.writableEnded) {
          res.write(':\n\n')
        } else {
          clearInterval(keepAlive)
        }
      }, 30000)

      // Cleanup
      const cleanup = () => {
        clearInterval(keepAlive)
        this.sseClients.delete(client)
        fileLogger.info('🔌 SSE client disconnected')
      }
      req.on('close', cleanup)
      req.on('aborted', cleanup)
      res.on('close', cleanup)
      res.on('finish', cleanup)
    })

    // Messages endpoint for MCP Inspector (JSON-RPC over HTTP POST)
    this.app.post('/messages', authMiddleware, express.json(), (req, res) => {
      const message = req.body
      let sent = 0
      for (const client of this.sseClients) {
        try {
          client.res.write(`data: ${JSON.stringify(message)}\n\n`)
          sent++
        } catch {
          // Ignore errors, cleanup will handle dead connections
        }
      }
      res.status(200).json({ ok: true, sent })
    })

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        transport: 'sse',
        sessions: this.sessionStore.size,
        uptime: process.uptime(),
      })
    })
  }

  // --- Transport Methods ---
  async send(
    message: JSONRPCMessage,
    options?: TransportSendOptions
  ): Promise<void> {
    if (this.options.mode === 'sse') {
      // Broadcast a todos los clientes SSE
      let sent = 0
      for (const client of this.sseClients) {
        try {
          client.res.write(`data: ${JSON.stringify(message)}\n\n`)
          sent++
        } catch {
          // Ignore errors, cleanup will handle dead connections
        }
      }
      if (sent === 0) {
        console.warn('No SSE clients connected to send message')
      }
    } else {
      // HTTP MCP: delega a StreamableHTTPServerTransport
      await this.transport.send(message, options)
    }
  }

  async disconnect(): Promise<void> {
    if (this.server) {
      fileLogger.info('🛑 Shutting down HTTPServers...')
      return new Promise((resolve) => {
        this.server?.close(() => {
          fileLogger.info('✅ HTTPServers stopped')
          resolve(undefined)
        })
      })
    }
  }

  async close(): Promise<void> {
    await this.disconnect()
  }

  // Helpers
  getRootsForSession(sessionId: string) {
    return this.sessionRoots.get(sessionId) || []
  }
}
