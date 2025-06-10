// @ts-expect-error - El SDK puede no tener tipos correctamente definidos
import { Tool } from '@modelcontextprotocol/sdk'

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

// Array of tools to export
const tools: Tool[] = [
  // myTool
]

export default tools
