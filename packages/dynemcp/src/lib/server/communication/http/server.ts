import express, { type Express, type RequestHandler } from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { TransportError } from '../core/errors'
import { isJSONRPCNotification } from '../core/jsonrpc'
import { parseRootList } from '../../api/core/root'

import {
  createDefaultConfig,
  type StreamableHTTPTransportConfig,
} from '../../config'
import {
  handleSessionManagement,
  handleSessionTermination,
} from './core/session'
import { setupMiddleware } from './core/middleware'
import { generateSecureSessionId } from './core/utils'
import { registry } from '../../registry/core/registry'
import {
  DYNEMCP_SERVER,
  TRANSPORT,
} from '../../../../global/config-all-contants'

export class StreamableHTTPTransport {
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

    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => generateSecureSessionId(),
    })
  }

  async connect(server: McpServer): Promise<void> {
    try {
      // 1. Get the user middleware path from the registry
      const middlewarePath = registry.getAuthenticationMiddlewarePath()
      let userAuthMiddleware: RequestHandler
      if (!middlewarePath) {
        console.warn(DYNEMCP_SERVER.ERRORS.MIDDLEWARE_NOT_FOUND)
        userAuthMiddleware = (req, res, next) => next()
      } else {
        // 2. Dynamically import the user's middleware
        userAuthMiddleware = (await import(middlewarePath)).default
        if (typeof userAuthMiddleware !== 'function') {
          console.warn(DYNEMCP_SERVER.ERRORS.MIDDLEWARE_NOT_FOUND)
          userAuthMiddleware = (req, res, next) => next()
        }
      }

      await server.connect(this.transport)
      this.setupEndpoints(userAuthMiddleware)

      this.server = this.app.listen(this.port, this.host, () => {
        console.log(
          `📡 Streamable HTTP transport listening on ${this.host}:${this.port}`
        )
        console.log(
          `🌐 MCP endpoint: http://${this.host}:${this.port}${this.endpoint}`
        )
        if (this.options?.session?.enabled)
          console.log('🔐 Session management enabled')
        if (this.options?.authentication?.path)
          console.log('🔒 Authentication enabled')
        if (this.options?.resumability?.enabled)
          console.log('📡 Resumability enabled')
      })

      process.on('SIGTERM', () => this.disconnect())
      process.on('SIGINT', () => this.disconnect())
    } catch (error) {
      throw TransportError.connectionError(
        `Failed to start Streamable HTTP transport: ${error}`
      )
    }
  }

  private setupEndpoints(authMiddleware: RequestHandler) {
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
            console.log(`🌱 Roots updated for session ${sessionId}:`, roots)
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
          res.status(401).json({ error: 'Unauthorized' })
        }
      }
    })

    // SSE GET endpoint for server-initiated events
    this.app.get(this.endpoint, authMiddleware, async (req, res) => {
      try {
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        const lastEventId = req.headers['last-event-id'] as string | undefined
        if (lastEventId && this.options?.resumability?.enabled) {
          console.log(`📡 Resuming from event ID: ${lastEventId}`)
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
          console.log('🔌 SSE connection closed')
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

  async disconnect(): Promise<void> {
    if (this.server) {
      console.log('🛑 Shutting down Streamable HTTP transport...')
      return new Promise((resolve) => {
        this.server?.close(() => {
          console.log('✅ Streamable HTTP transport stopped')
          resolve()
        })
      })
    }
  }

  getRootsForSession(sessionId: string) {
    return this.sessionRoots.get(sessionId) || []
  }
}
