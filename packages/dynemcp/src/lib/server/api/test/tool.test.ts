import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { createTypedTool, tool } from '../core/tool'

describe('tool API', () => {
  it('normalizes string result using createTypedTool', async () => {
    const schema = z.object({ name: z.string() })

    const helloTool = createTypedTool({
      name: 'hello',
      description: 'Greets the user',
      schema,
      execute: (input) => `Hello ${input.name}`,
    })

    const res = await helloTool.execute({ name: 'World' })
    expect(res).toEqual({
      content: [{ type: 'text', text: 'Hello World' }],
    })
  })

  it('returns isError when execute throws', async () => {
    const schema = z.object({})
    const errorTool = createTypedTool({
      name: 'fail',
      description: 'Always fails',
      schema,
      execute: () => {
        throw new Error('boom')
      },
    })

    const res = (await errorTool.execute({})) as any
    expect(res.isError).toBe(true)
    expect(res.content[0].text).toMatch(/boom/)
  })

  it('tool() helper normalizes array output', async () => {
    const schema = z.object({ nums: z.array(z.number()) })
    const listTool = tool(schema, ({ nums }) => nums.map((n) => `Num ${n}`), {
      name: 'nums',
      description: 'List numbers',
    })

    const res = (await listTool.execute({ nums: [1, 2, 3] })) as any
    expect(res.content.length).toBe(3)
    expect(res.content[0].text).toBe('Num 1')
  })
})
