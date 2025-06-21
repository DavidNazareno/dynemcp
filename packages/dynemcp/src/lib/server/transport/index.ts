import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express from 'express'
import cors from 'cors'
import { TransportConfig } from '../core/interfaces.js'
import path from 'path'
import { randomUUID } from 'crypto'

export interface Transport {
  connect(server: McpServer): Promise<void>
  disconnect?(): Promise<void>
}

export class StdioTransport implements Transport {
  async connect(server: McpServer): Promise<void> {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.log('📡 Connected via stdio transport')
  }
}

export class SSETransport implements Transport {
  constructor(
    _config: NonNullable<TransportConfig & { type: 'sse' }>['options'] = {}
  ) {
    // Configuration would be used in actual implementation
    // const _config = {
    //   port: 8080,
    //   endpoint: '/sse',
    //   messageEndpoint: '/messages',
    //   cors: {
    //     allowOrigin: '*',
    //     allowMethods: 'GET, POST, OPTIONS',
    //     allowHeaders: 'Content-Type, Authorization, x-api-key',
    //     exposeHeaders: 'Content-Type, Authorization, x-api-key',
    //     maxAge: '86400',
    //   },
    //   ...config,
    // };
  }

  async connect(_server: McpServer): Promise<void> {
    // Note: SSE transport implementation would require additional dependencies
    // For now, we'll throw an error indicating it's not yet implemented
    throw new Error(
      'SSE transport is deprecated and not implemented. Please use http-stream instead.'
    )
  }
}

export class HTTPStreamTransport implements Transport {
  private app: express.Express
  private port: number
  private endpoint: string
  private options: NonNullable<
    TransportConfig & { type: 'http-stream' }
  >['options']
  private transport: StreamableHTTPServerTransport

  constructor(
    options: NonNullable<
      TransportConfig & { type: 'http-stream' }
    >['options'] = {}
  ) {
    this.app = express()
    this.app.use(express.json())
    this.app.use(cors(options.cors))

    this.port = options.port ?? 8080
    this.endpoint = options.endpoint ?? '/mcp'
    this.options = options
    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: randomUUID,
    })
  }

  async connect(server: McpServer): Promise<void> {
    let authMiddleware: express.RequestHandler = (req, res, next) => next()

    if (this.options?.authentication?.path) {
      try {
        const middlewarePath = path.resolve(this.options.authentication.path)
        const middlewareModule = await import(middlewarePath)
        if (typeof middlewareModule.default !== 'function') {
          throw new Error(
            'Authentication middleware must export a default function.'
          )
        }
        authMiddleware = middlewareModule.default
        console.log(
          `🔒 Authentication middleware loaded from ${middlewarePath}`
        )
      } catch (error) {
        console.error('Failed to load authentication middleware:', error)
        // Terminate process if auth middleware fails to load as it's a critical component
        process.exit(1)
      }
    }

    await server.connect(this.transport)

    this.app.all(this.endpoint, authMiddleware, async (req, res) => {
      await this.transport.handleRequest(req, res)
    })

    this.app.listen(this.port, () => {
      console.log(
        `📡 Connected via HTTP Stream transport, listening on port ${this.port}`
      )
    })
  }
}

export function createTransport(config: TransportConfig): Transport {
  switch (config.type) {
    case 'stdio':
      return new StdioTransport()
    case 'sse':
      return new SSETransport(config.options)
    case 'http-stream':
      return new HTTPStreamTransport(config.options)
    default:
      throw new Error(`Unsupported transport type: ${(config as any).type}`)
  }
}
