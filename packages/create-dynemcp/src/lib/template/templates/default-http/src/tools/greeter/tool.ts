import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

// --- Schema (Arguments) --- //
// Defines the input schema for the greeter tool
const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
  image: z.string().url().optional().describe('Optional image URL'),
})

// --- Export --- //
// This tool demonstrates the new DX: you can return a string, simple object, array, or full MCP object
export default tool(
  GreeterSchema,
  async ({ name, image }: { name: string; image?: string }) => {
    if (!name?.trim()) {
      // Return a simple string (normalized to content:text)
      return 'Name cannot be empty'
    }
    // Return a simple string
    if (!image) return `Hello, ${name}!`
    // Return an array of strings and advanced objects
    return [
      `Hello, ${name}!`,
      { type: 'image', url: image, alt: `Avatar for ${name}` },
    ]
  },
  {
    name: 'greeter',
    description: 'A simple tool that greets the user and can return an image',
    meta: {
      title: 'Greeter Tool',
      readOnlyHint: true,
      openWorldHint: false,
    },
  }
)
