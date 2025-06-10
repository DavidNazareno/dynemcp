// Importar directamente del SDK oficial de MCP
// @ts-expect-error - El SDK puede no tener tipos correctamente definidos
import { MCPServer, StdioServerTransport } from '@modelcontextprotocol/sdk'
import tools from '../tools/tools.js'
import resources from '../resources/resource.js'
import prompt from '../prompt/prompt.js'

// Initialize the MCP server
const server = new MCPServer({
  name: 'dynemcp-project',
  version: '0.1.0',
  tools: tools || [],
  resources: resources || [],
  prompt: prompt || ''
})

// Conectar el servidor a la entrada/salida estándar
if (process.env.NODE_ENV === 'development') {
  console.log(
    'Modo desarrollo: El servidor se iniciará a través del inspector MCP'
  )
} else {
  // En producción, conectar directamente
  server.connect(new StdioServerTransport()).catch((error: Error) => {
    console.error('Failed to start MCP server:', error)
    process.exit(1)
  })
}
