import { describe, it, expect, vi, beforeEach } from 'vitest'

// ------------------------------------------------------------
// Mocks
// ------------------------------------------------------------

// Mock express to provide minimal API
const listenMock = vi.fn((_port: number, _host: string, cb: () => void) => {
  cb()
  return { close: vi.fn() } as any
})
function createApp() {
  const routes: Record<string, any[]> = {}
  const methodFn =
    (method: string) =>
    (path: string, ...handlers: any[]) => {
      routes[`${method}:${path}`] = handlers
    }
  return {
    get: methodFn('GET'),
    post: methodFn('POST'),
    delete: methodFn('DELETE'),
    listen: listenMock,
    routes,
  }
}
vi.mock('express', () => {
  const exp = () => createApp()
  Object.assign(exp, { json: () => (req: any, _res: any, next: any) => next() })
  return { default: exp }
})

// Mock SDK classes
vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: class {
    async handleRequest() {
      return undefined
    }
    async send() {
      return undefined
    }
  },
}))
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: class {
    async connect() {
      return undefined
    }
  },
}))

// Mock registry
vi.mock('../../registry/core/registry', () => ({
  registry: { getAuthenticationMiddlewarePath: () => null },
}))
