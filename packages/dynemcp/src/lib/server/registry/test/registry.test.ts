import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock dependencies used by registry.ts BEFORE importing it
// ---------------------------------------------------------------------------

vi.mock('../../components/component-loader', () => {
  const fakeTool = { name: 'tool1' }
  const fakeResource = {
    name: 'res1',
    uri: 'resource://res1',
    content: 'data',
  }
  const fakePrompt = { name: 'prompt1' }
  return {
    loadToolsFromDirectory: vi.fn().mockResolvedValue({
      components: [fakeTool],
      errors: [],
    }),
    loadResourcesFromDirectory: vi.fn().mockResolvedValue({
      components: [fakeResource],
      errors: [],
    }),
    loadPromptsFromDirectory: vi.fn().mockResolvedValue({
      components: [fakePrompt],
      errors: [],
    }),
    loadMiddlewareFromDirectory: vi.fn().mockResolvedValue({ components: [] }),
    loadAllComponents: vi.fn().mockResolvedValue({
      tools: [fakeTool],
      resources: [fakeResource],
      prompts: [fakePrompt],
      errors: [],
    }),
  }
})

vi.mock('../../components/core/loaders/validators', () => ({
  validateTool: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Import subject under test
// ---------------------------------------------------------------------------
import { DyneMCPRegistry } from '../core/registry'

describe('DyneMCPRegistry', () => {
  let registry: DyneMCPRegistry

  beforeEach(() => {
    registry = new DyneMCPRegistry()
  })

  it('loadAll loads components and sets stats', async () => {
    await registry.loadAll({
      tools: 'toolsDir',
      resources: 'resDir',
      prompts: 'promptsDir',
    } as any)

    expect(registry.stats.tools).toBe(1)
    expect(registry.stats.resources).toBe(1)
    expect(registry.stats.prompts).toBe(1)
  })

  it('getAllTools returns loaded tools metadata', async () => {
    await registry.loadAll({} as any)
    const tools = registry.getAllTools()
    expect(tools.length).toBe(1)
    expect(tools[0].module.name).toBe('tool1')
  })

  it('clear resets state', async () => {
    await registry.loadAll({} as any)
    registry.clear()
    expect(registry.stats.total).toBe(0)
    expect(registry.loaded).toBe(false)
  })

  it('pagination utilities return expected slice', async () => {
    await registry.loadAll({} as any)
    const page = registry.getPaginatedTools(undefined, 1)
    expect(page.items.length).toBe(1)
    expect(page.nextCursor).toBeUndefined()
  })
})
