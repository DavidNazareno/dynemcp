import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

export default tool(
  GreeterSchema,
  async ({ name }) => {
    if (!name?.trim()) {
      return {
        content: [{ type: 'text', text: 'Name cannot be empty' }],
        isError: true,
      }
    }
    return {
      content: [{ type: 'text', text: `Hello, ${name}!` }],
    }
  },
  {
    name: 'greeter',
    description: 'A simple tool that greets the user',
    meta: {
      title: 'Greeter Tool',
      readOnlyHint: true,
      openWorldHint: false,
    },
  }
)
