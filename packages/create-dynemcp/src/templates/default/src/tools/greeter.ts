import { DyneMCPTool, CallToolResult } from '@dynemcp/dynemcp'
import { z } from 'zod'

const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

export class GreeterTool extends DyneMCPTool {
  readonly name = 'greeter'
  readonly description = 'A simple tool that greets the user'
  readonly inputSchema = GreeterSchema.shape
  override readonly annotations = {
    title: 'Greeter Tool',
    readOnlyHint: true,
    openWorldHint: false,
  }

  execute(input: z.infer<typeof GreeterSchema>): CallToolResult {
    const { name } = input

    if (!name?.trim()) {
      return {
        content: [{ type: 'text', text: 'Name cannot be empty' }],
        isError: true,
      }
    }

    return {
      content: [{ type: 'text', text: `Hello, ${name}!` }],
    }
  }
}

export default new GreeterTool()
