import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { TransportError } from '../core/errors'
import { NETWORK, CLI } from '../../../../global/config-all-contants'
import { isJSONRPCNotification } from '../core/jsonrpc'
import { parseRootList } from '../../api/core/root'
import { registry } from '../../registry/core/registry'
import rateLimit from 'express-rate-limit'
import { createDefaultConfig } from '../../config/core/defaults'
import { oauth2JwtMiddleware } from '../../api/auth/oauth2-middleware'

/**
 * StreamableHTTPTransport provides HTTP POST and optional SSE streaming for MCP communication.
 * Suitable for web-based integrations, stateful sessions, and resumable connections.
 */
export class StreamableHTTPTransport {
  private app: express.Express
  private port: number
  private endpoint: string
  private host: string
  private options: any
  private transport: StreamableHTTPServerTransport
  private server?: any
  private sessionStore = new Map<
    string,
    { id: string; created: Date; lastAccess: Date }
  >()
  private sessionRoots = new Map<string, any>() // sessionId -> roots

  constructor(options: any = {}) {
    this.app = express()
    this.setupMiddleware(options)

    this.port = options.port ?? NETWORK.DEFAULT_HTTP_PORT
    this.host = options.host ?? NETWORK.DEFAULT_HTTP_HOST
    this.endpoint = options.endpoint ?? NETWORK.DEFAULT_MCP_ENDPOINT
    this.options = options

    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => this.generateSecureSessionId(),
    })
  }

  /**
   * Sets up middleware for security, CORS, and JSON parsing.
   */
  private setupMiddleware(options: Record<string, unknown>): void {
    // Rate limiting (security best practice)
    let rateLimitOptions = (options as any).rateLimit
    const isProduction = process.env.NODE_ENV === 'production'
    if (!rateLimitOptions) {
      // Buscar en la config global de seguridad
      const globalConfig = createDefaultConfig()
      const securityRateLimit = globalConfig.security?.rateLimit
      if (securityRateLimit && securityRateLimit.enabled !== false) {
        rateLimitOptions = {
          windowMs: securityRateLimit.windowMs ?? 15 * 60 * 1000,
          max: securityRateLimit.maxRequests ?? 100,
          standardHeaders: true,
          legacyHeaders: false,
          message: {
            error: 'Too many requests, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        }
      }
    }
    if (!rateLimitOptions) {
      rateLimitOptions = {
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          error: 'Too many requests, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      }
    }
    if (
      isProduction &&
      (rateLimitOptions.max === 0 || rateLimitOptions.enabled === false)
    ) {
      throw new Error(
        '[SECURITY] Rate limiting must be enabled in production. Set security.rateLimit.enabled = true or configure rateLimit in transport options.'
      )
    } else if (
      !isProduction &&
      (rateLimitOptions.max === 0 || rateLimitOptions.enabled === false)
    ) {
      console.warn(
        '[SECURITY] WARNING: Rate limiting is disabled. This is unsafe for production.'
      )
    }
    this.app.use(rateLimit(rateLimitOptions))

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

  /**
   * Generates a secure session ID for session management.
   */
  private generateSecureSessionId(): string {
    return randomUUID()
  }

  /**
   * Checks if the given origin is allowed for CORS.
   */
  private isOriginAllowed(origin: string): boolean {
    const allowedOrigins = this.options?.cors?.allowOrigin
    if (!allowedOrigins || allowedOrigins === '*') return true
    if (Array.isArray(allowedOrigins)) {
      return allowedOrigins.includes(origin)
    }
    return allowedOrigins === origin
  }

  /**
   * Validates a JSON-RPC message structure.
   * Throws an error if the message is invalid.
   */
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

  /**
   * Handles session management for incoming requests.
   */
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

  /**
   * Handles session termination requests.
   */
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

  /**
   * Dynamically loads authentication middleware if configured.
   */
  private async loadAuthenticationMiddleware(): Promise<express.RequestHandler> {
    // Use registry to find src/middleware.ts automatically
    const middlewarePath = registry.getAuthenticationMiddlewarePath()
    if (!middlewarePath) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'Authentication middleware (src/middleware.ts) is required in production. Please create src/middleware.ts and export a default Express middleware.'
        )
      }
      // In development, allow all requests but log a warning
      console.warn(
        '⚠️ No authentication middleware (src/middleware.ts) found. All requests are allowed (development only).'
      )
      return (req, res, next) => next()
    }
    try {
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

  /**
   * Connects the MCP server using streamable HTTP transport.
   * Sets up all endpoints and session management.
   */
  async connect(server: McpServer): Promise<void> {
    try {
      // Obtener configuración de OAuth2 desde transport.options o defaults
      const config = this.options || {}
      const defaultConfig = createDefaultConfig()
      // Cast config to any to allow custom fields (oauth2Issuer, oauth2Audience)
      const userOptions = config as any
      const oauth2Issuer =
        (userOptions as { oauth2Issuer?: string }).oauth2Issuer ||
        (defaultConfig.transport.options as { oauth2Issuer?: string })
          ?.oauth2Issuer ||
        'https://your-auth-server'
      const oauth2Audience =
        (userOptions as { oauth2Audience?: string }).oauth2Audience ||
        (defaultConfig.transport.options as { oauth2Audience?: string })
          ?.oauth2Audience ||
        `https://${this.host}:${this.port}${this.endpoint}`
      // Expose OAuth2 Protected Resource Metadata endpoint
      this.app.get('/.well-known/oauth-protected-resource', (req, res) => {
        res.json({
          authorization_servers: [
            oauth2Issuer + '/.well-known/oauth-authorization-server',
          ],
          resource: oauth2Audience,
        })
      })
      // Load authentication middleware
      let authMiddleware: express.RequestHandler
      if (process.env.NODE_ENV === 'production') {
        authMiddleware = oauth2JwtMiddleware({
          issuerBaseURL: oauth2Issuer,
          audience: oauth2Audience,
        })
      } else {
        const jwtMiddleware = (await import('../../api/auth/jwt-middleware'))
          .default
        authMiddleware = (req, res, next) => {
          jwtMiddleware()(req, res, next)
        }
      }
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
          if (res.headersSent) return // Auth middleware already responded

          // Handle session management
          const sessionId = this.handleSessionManagement(req, res)
          if (res.headersSent) return // Session validation failed

          // --- ROOTS NOTIFICATION HANDLER ---
          const body = req.body
          if (
            isJSONRPCNotification(body) &&
            body.method === 'roots/didChange'
          ) {
            // Only handle if session is enabled
            if (sessionId) {
              const roots = parseRootList(body.params)
              this.sessionRoots.set(sessionId, roots)
              res.status(200).json({ result: 'Roots updated', roots })
              console.log(`🌱 Roots updated for session ${sessionId}:`, roots)
              return
            } else {
              res
                .status(400)
                .json({ error: 'Session required for roots/didChange' })
              return
            }
          }
          // --- END ROOTS HANDLER ---

          // Process the request through StreamableHTTPServerTransport
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
      throw TransportError.connectionError(
        `Failed to start Streamable HTTP transport: ${error}`
      )
    }
  }

  /**
   * Gracefully disconnects the HTTP server and cleans up resources.
   */
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

  /**
   * Get the current roots for a session (if any)
   */
  getRootsForSession(sessionId: string) {
    return this.sessionRoots.get(sessionId) || []
  }
}
