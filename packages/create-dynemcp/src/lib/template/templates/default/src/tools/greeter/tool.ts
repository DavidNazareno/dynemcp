import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

// --- Schema (Arguments) --- //
// Defines the input schema for the greeter tool
const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
  image: z.string().url().optional().describe('Optional image URL'),
})

// --- Export --- //
// Esta tool demuestra la nueva DX: puedes retornar string, objeto simple, array, o MCP completo
export default tool(
  GreeterSchema,
  async ({ name, image }: { name: string; image?: string }) => {
    if (!name?.trim()) {
      // Retornar string simple (se normaliza a content:text)
      return 'Name cannot be empty'
    }
    // Retornar string simple
    if (!image) return `Hello, ${name}!`
    // Retornar array de strings y objetos avanzados
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

// Ejemplo de uso avanzado:
// Puedes retornar directamente un objeto content personalizado:
// return { type: 'image', url: 'https://...', alt: 'desc' }
// O un array de content items:
// return [
//   'Hola',
//   { type: 'image', url: 'https://...', alt: 'desc' }
// ]
// O el objeto MCP completo:
// return { content: [...], isError: true }
