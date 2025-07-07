import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

import {
  registerTools,
  registerResources,
  registerPrompts,
} from '../core/initializer'

// ---------------------------------------------------------------------------
// Helper mock server implementation
// ---------------------------------------------------------------------------
function createMockServer() {
  return {
    registerTool: vi.fn(),
    registerResource: vi.fn(),
    registerPrompt: vi.fn(),
  }
}

describe('initializer utilities', () => {
  it('registerTools registers tool and handler returns normalized content', async () => {
    const server = createMockServer()
    const tool = {
      name: 'echo',
      description: 'Echoes text',
      execute: ({ text }: any) => `Echo: ${text}`,
      inputSchema: { text: z.string() },
      annotations: {},
    } as any

    registerTools(server as any, [tool])

    expect(server.registerTool).toHaveBeenCalledTimes(1)
    const [, , handler] = server.registerTool.mock.calls[0]

    const result = await handler({ text: 'Hi' })
    expect(result.content[0].text).toBe('Echo: Hi')
  })

  it('registerResources registers resource and handler returns content', async () => {
    const server = createMockServer()
    const resDef = {
      name: 'myRes',
      uri: 'resource://my',
      description: 'desc',
      content: 'hello world',
    } as any

    registerResources(server as any, [resDef])

    expect(server.registerResource).toHaveBeenCalled()
    const [, , , handler] = server.registerResource.mock.calls[0]
    const out = await handler()
    expect(out.contents[0].text).toBe('hello world')
  })

  it('registerPrompts registers prompt and handler returns messages', async () => {
    const server = createMockServer()
    const prompt = {
      name: 'greet',
      description: 'Greets',
      arguments: [{ name: 'who', required: true }],
      getMessages: async (args: any) => [
        {
          role: 'assistant',
          content: { type: 'text', text: `Hello ${args?.who}` },
        },
      ],
    } as any

    registerPrompts(server as any, [prompt])

    expect(server.registerPrompt).toHaveBeenCalled()
    const [, , handler] = server.registerPrompt.mock.calls[0]
    const res = await handler({ who: 'World' })
    expect(res.messages[0].content.text).toBe('Hello World')
  })
})
