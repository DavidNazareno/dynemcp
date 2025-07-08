import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

// --- Schema (Arguments) --- //
// Defines the input schema for the greeter tool
const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

// --- Export --- //
// This tool demonstrates the new DX: you can return a string, simple object, array, or full MCP object
export default tool(
  GreeterSchema,
  async ({ name }: { name: string; }) => {
    if (!name?.trim()) {
      // Return a simple string (normalized to content:text)
      return 'Name cannot be empty'
    }
    // Return a simple string
    return `Hello, ${name}!`
  },
  {
    name: 'greeter 2',
    description: 'A simple tool that greets the user',
    meta: {
      title: 'Greeter Tool 2',
      readOnlyHint: true,
      openWorldHint: false,
    },
  }
)
