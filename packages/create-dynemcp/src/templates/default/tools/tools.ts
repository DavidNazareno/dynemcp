import { DyneMCPTool, z } from '@dynemcp/server-dynemcp'

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

const ExampleToolSchema = z.object({
  message: z.string().describe('The message to echo'),
})

export class ExampleTool extends DyneMCPTool<typeof ExampleToolSchema> {
  name = 'echo'
  description = 'Echo a message back to the user'
  schema = ExampleToolSchema

  async execute({ message }: z.infer<typeof ExampleToolSchema>) {
    return {
      result: `Echo: ${message}`,
      timestamp: new Date().toISOString(),
    }
  }
}

export default new ExampleTool()
