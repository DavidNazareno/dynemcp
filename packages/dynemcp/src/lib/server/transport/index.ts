import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { TransportConfig } from '../core/interfaces.js'

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
      'SSE transport is not yet implemented. Please use stdio transport for now.'
    )
  }
}

export class HTTPStreamTransport implements Transport {
  constructor(
    _config: NonNullable<
      TransportConfig & { type: 'http-stream' }
    >['options'] = {}
  ) {
    // Configuration would be used in actual implementation
    // const _config = {
    //   port: 8080,
    //   endpoint: '/mcp',
    //   responseMode: 'batch',
    //   batchTimeout: 30000,
    //   maxMessageSize: '4mb',
    //   session: {
    //     enabled: true,
    //     headerName: 'Mcp-Session-Id',
    //     allowClientTermination: true,
    //   },
    //   resumability: {
    //     enabled: false,
    //     historyDuration: 300000,
    //   },
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
    // Note: HTTP Stream transport implementation would require additional dependencies
    // For now, we'll throw an error indicating it's not yet implemented
    throw new Error(
      'HTTP Stream transport is not yet implemented. Please use stdio transport for now.'
    )
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
