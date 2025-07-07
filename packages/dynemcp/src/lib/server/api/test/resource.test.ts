import { describe, it, expect } from 'vitest'
import { resource, getResourceMeta } from '../core/resource'

describe('resource API', () => {
  it('creates resource definition and returns content', async () => {
    const res = resource({
      uri: 'resource://test',
      name: 'Test Resource',
      description: 'Desc',
      mimeType: 'text/plain',
      getContent: () => 'hello',
    })

    const content = await res.content()
    expect(content).toBe('hello')

    const meta = getResourceMeta(res)
    expect(meta).toMatchObject({
      uri: 'resource://test',
      name: 'Test Resource',
      description: 'Desc',
    })
    // internal functions should be omitted
    expect(meta).not.toHaveProperty('content')
  })
})
