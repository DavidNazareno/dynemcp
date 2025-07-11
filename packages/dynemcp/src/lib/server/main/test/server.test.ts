import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  class MockMcpServer {
    registerTool = vi.fn()
    registerResource = vi.fn()
    registerPrompt = vi.fn()
    connect = vi.fn()
  }
  return { McpServer: MockMcpServer }
})

// Import paths relative to server.ts can stay as-is; we monkey-patch after import

vi.mock('../../../registry/core/registry', () => {
  const mockRegistry: any = {
    loadAll: vi.fn().mockResolvedValue(undefined),
    getAllTools: vi.fn().mockReturnValue([{ module: { name: 'tool1' } }]),
    getAllResources: vi.fn().mockReturnValue([{ module: { name: 'res1' } }]),
    getAllPrompts: vi.fn().mockReturnValue([{ module: { name: 'prompt1' } }]),
    getAllResourceObjects: vi
      .fn()
      .mockReturnValue([{ name: 'res1', uri: 'u', content: 'c' }]),
    stats: { total: 1 },
  }
  return { registry: mockRegistry }
})

// We will import the mocked registry for assertions
import { registry as mockRegistry } from '../../registry/core/registry'

const transportConnect = vi.fn()
const transportClose = vi.fn()
vi.mock('../communication', () => ({
  createTransport: () => ({ connect: transportConnect, close: transportClose }),
}))
// Also mock the path used in server.ts ('../../communication') to ensure interception
vi.mock('../../communication', () => ({
  createTransport: () => ({ connect: transportConnect, close: transportClose }),
}))

// ---------------------------------------------------------------------------
// Import subject under test AFTER mocks are in place
// ---------------------------------------------------------------------------
import { DyneMCP } from '../core/server'

describe('DyneMCP server class', () => {
  const cfg = {
    server: { name: 'test-srv', version: '0.0.1' },
    tools: [],
    resources: [],
    prompts: [],
  } as any

  beforeEach(() => {
    vi.resetAllMocks()
    Object.assign(mockRegistry, {
      loadAll: vi.fn().mockResolvedValue(undefined),
      getAllTools: vi.fn().mockReturnValue([{ module: { name: 'tool1' } }]),
      getAllResources: vi.fn().mockReturnValue([{ module: { name: 'res1' } }]),
      getAllPrompts: vi.fn().mockReturnValue([{ module: { name: 'prompt1' } }]),
    })
    vi.spyOn(mockRegistry, 'loaded', 'get').mockReturnValue(false)
  })

  it('initializes and exposes loaded components', async () => {
    const mcp = await DyneMCP.create(cfg)
    expect(mcp.getConfig()).toBe(cfg)

    await mcp.init()

    expect(mockRegistry.loadAll).toHaveBeenCalledWith({
      tools: cfg.tools,
      resources: cfg.resources,
      prompts: cfg.prompts,
    })

    expect(mcp.tools[0].name).toBe('tool1')
    expect(mcp.resources[0].name).toBe('res1')
    expect(mcp.prompts[0].name).toBe('prompt1')
  })

  it('start() completes without error', async () => {
    await expect(DyneMCP.start()).resolves.not.toThrow()
  })
})
