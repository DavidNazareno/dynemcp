import { z } from 'zod'
import type { ToolDefinition, CallToolResult } from '@dynemcp/dynemcp'

// Define your tools here
// Example:
// const myTool: ToolDefinition = {
//   name: 'myTool',
//   description: 'A tool that does something',
//   inputSchema: {
//     input: z.string().describe('The input to process')
//   },
//   async execute({ input }): Promise<CallToolResult> {
//     return {
//       content: [
//         {
//           type: 'text',
//           text: `Processed: ${input}`,
//         },
//       ],
//     }
//   },
// }

const greeterTool: ToolDefinition = {
  name: 'greeter',
  description: 'A simple tool that greets the user',
  inputSchema: {
    name: z.string().describe('The name to greet'),
  },
  annotations: {
    title: 'Greeter Tool',
    readOnlyHint: true,
    openWorldHint: false,
  },
  async execute({ name }: { name: string }): Promise<CallToolResult> {
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

export default greeterTool
