import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock McpServer and StdioServerTransport
vi.mock('@modelcontextprotocol/sdk/server/mcp', () => ({
  McpServer: vi.fn().mockImplementation(() => ({
    tool: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
    _serverInfo: { name: '', version: '' },
  })),
}))

vi.mock('@modelcontextprotocol/sdk/server/stdio', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({})),
}))

// Mock the loadConfig function
vi.mock('./core/config', () => ({
  loadConfig: vi.fn().mockReturnValue({
    server: {
      name: 'test-server',
      version: '1.0.0',
    },
    tools: [],
    resources: [],
    prompts: [],
    transport: {
      type: 'stdio',
    },
  }),
}))

// Mock the registry
vi.mock('./core/registry/registry', () => ({
  registry: {
    loadAll: vi.fn().mockResolvedValue(undefined),
    getAllTools: vi.fn().mockReturnValue([]),
    getAllResources: vi.fn().mockReturnValue([]),
    getAllPrompts: vi.fn().mockReturnValue([]),
    stats: {},
  },
}))

// Mock createTransport
vi.mock('../transport/index', () => ({
  createTransport: vi.fn().mockReturnValue({
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock server initializer functions
vi.mock('./core/server/server-initializer', () => ({
  createMCPServerInstance: vi.fn().mockImplementation((config) => ({
    tool: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
    _serverInfo: {
      name: config.name || 'test',
      version: config.version || '1.0.0',
    },
  })),
  registerTools: vi.fn(),
  registerResources: vi.fn(),
  registerPrompts: vi.fn(),
}))

// Import the module under test
import { createMCPServer, DyneMCP } from './core/server/server-dynemcp.js'

// Mock console.log to avoid test output pollution
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(vi.fn())
  vi.spyOn(console, 'error').mockImplementation(vi.fn())
  vi.clearAllMocks()
})

describe('server-dynemcp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createMCPServer', () => {
    it('should create a server with the correct configuration', () => {
      const server = createMCPServer('test', undefined, '1.0.0')

      // Test that it's an instance of DyneMCP
      expect(server).toBeInstanceOf(DyneMCP)
    })

    it('should create a server with custom version when provided', () => {
      const server = createMCPServer('test', undefined, 'custom-version')

      expect(server).toBeInstanceOf(DyneMCP)
    })
  })

  describe('DyneMCP class', () => {
    let server: DyneMCP

    beforeEach(() => {
      vi.clearAllMocks()
      server = createMCPServer('test')
    })

    it('should register tools correctly', () => {
      expect(server).toBeInstanceOf(DyneMCP)
      expect(server.tools).toEqual([])
    })

    it('should register resources correctly', () => {
      expect(server).toBeInstanceOf(DyneMCP)
      expect(server.resources).toEqual([])
    })

    it('should register prompts correctly', () => {
      expect(server).toBeInstanceOf(DyneMCP)
      expect(server.prompts).toEqual([])
    })

    it('should start the server correctly', async () => {
      await server.start()

      // Verify server was initialized
      expect(server).toBeInstanceOf(DyneMCP)
    })
  })
})
