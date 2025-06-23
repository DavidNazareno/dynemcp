import { z } from 'zod'
import type { ToolDefinition } from '@dynemcp/dynemcp'

// Define your tools here
// Example:
// const myTool: Tool = {
//   name: 'myTool',
//   description: 'A tool that does something',
//   parameters: {
//     type: 'object',
//     properties: {
//       input: { type: 'string' }
//     },
//     required: ['input']
//   },
//   handler: async ({ input }) => {
//     return { result: `Processed: ${input}` }
//   }
// }

const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

const greeterTool: ToolDefinition = {
  name: 'greeter',
  description: 'A simple tool that greets the user',
  schema: GreeterSchema,
  handler: async ({ name }: { name: string }) => {
    return { message: `Hello, ${name}!` }
  },
}

export default greeterTool
