import { DyneMCPTool, CallToolResult } from '@dynemcp/dynemcp'
import { z } from 'zod'

const GreetSchema = z.object({
  name: z.string().describe('The name of the person to greet'),
  style: z
    .enum(['formal', 'casual', 'friendly'])
    .optional()
    .describe('The greeting style (optional)'),
})

export class GreetTool extends DyneMCPTool {
  readonly name = 'greet'
  readonly description = 'Greets a person by name with customizable style'
  readonly inputSchema = GreetSchema.shape
  readonly annotations = {
    title: 'HTTP Greeter',
    readOnlyHint: true,
    openWorldHint: false,
  }

  execute(input: z.infer<typeof GreetSchema>): CallToolResult {
    const { name, style = 'friendly' } = input

    if (!name?.trim()) {
      return {
        content: [{ type: 'text', text: 'Name cannot be empty' }],
        isError: true,
      }
    }

    const greetings = {
      formal: `Good day, ${name}.`,
      casual: `Hey ${name}!`,
      friendly: `Hello, ${name}! Welcome to our HTTP server!`,
    }

    return {
      content: [{ type: 'text', text: greetings[style] }],
    }
  }
}

export default new GreetTool()
