import type { ToolDefinition } from '@dynemcp/server-dynemcp';

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
const tools: ToolDefinition[] = [
  // myTool
];

export default tools;
