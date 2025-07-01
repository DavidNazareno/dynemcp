import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

// --- Schema (Arguments) --- //
// Defines the input schema for the greeter tool
const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

// --- Logic --- //
// Returns a greeting message or an error if the name is empty
function greet(name: string) {
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

// --- Export --- //
// This tool greets the user by name
export default tool(
  GreeterSchema,
  async ({ name }: { name: string }) => greet(name),
  {
    name: 'greeter',
    description: 'A simple tool that greets the user',
    meta: {
      title: 'Greeter Tool',
      readOnlyHint: true,
      openWorldHint: false,
    },
  }
)
