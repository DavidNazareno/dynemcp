import { createMCPServer } from 'dynemcp'
import tools from '../tools/tools.js'
import resources from '../resources/resource.js'
import prompt from '../prompt/prompt.js'

// Initialize the MCP server
const server = createMCPServer('dynemcp-project', '1.0.0')

// Conectar el servidor a la entrada/salida estándar
if (process.env.NODE_ENV === 'development') {
  console.log('Modo desarrollo: El servidor se iniciará a través del inspector MCP')
} else {
  // En producción, conectar directamente
  import('@modelcontextprotocol/sdk').then(({ StdioServerTransport }) => {
    server
      .connect(new StdioServerTransport())
      .catch((error) => {
        console.error('Failed to start MCP server:', error)
        process.exit(1)
      })
  })
}
