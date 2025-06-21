import { DyneMCPTool } from '@dynemcp/dynemcp'
import { z } from 'zod'

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

export class GreeterTool extends DyneMCPTool {
  get name() {
    return 'greeter'
  }
  readonly description = 'A simple tool that greets the user'
  readonly schema = GreeterSchema

  async execute(
    input: z.infer<typeof GreeterSchema>
  ): Promise<{ message: string }> {
    return { message: `Hello, ${input.name}!` }
  }
}

export default new GreeterTool()
