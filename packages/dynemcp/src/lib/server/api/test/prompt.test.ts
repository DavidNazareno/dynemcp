import { describe, it, expect } from 'vitest'
import { prompt } from '../core/prompt'

describe('prompt API', () => {
  it('creates a loaded prompt with proper fields', async () => {
    const loaded = prompt({
      name: 'sample-prompt',
      description: 'A sample prompt',
      arguments: [
        { name: 'topic', description: 'Topic to discuss', required: true },
      ],
      getMessages: async () => [
        { role: 'system', content: 'Hello World' } as any,
      ],
    })

    expect(loaded.name).toBe('sample-prompt')
    expect(loaded.description).toBe('A sample prompt')
    expect(loaded.arguments?.length).toBe(1)

    const msgs = await loaded.getMessages({ topic: 'ai' } as any)
    expect(msgs).toEqual([{ role: 'system', content: 'Hello World' }])
  })
})
