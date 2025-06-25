import { z } from 'zod'
import { ToolDefinition, CallToolResult } from '@dynemcp/dynemcp'

const GreetSchema = z.object({
  name: z.string().describe('The name of the person to greet.'),
})

const greetTool: ToolDefinition = {
  name: 'greet',
  description: 'Greets a person by name.',
  inputSchema: {
    name: z.string().describe('The name of the person to greet'),
  },
  annotations: {
    title: 'HTTP Greeter',
    readOnlyHint: true,
    openWorldHint: false,
  },
  async execute({
    name,
  }: z.infer<typeof GreetSchema>): Promise<CallToolResult> {
    return {
      content: [
        {
          type: 'text',
          text: `Hello, ${name}!`,
        },
      ],
    }
  },
}

export default greetTool
