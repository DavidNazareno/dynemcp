import { createMCPServer } from '@dynemcp/dynemcp'

// Create MCP server instance
const server = createMCPServer()

async function main() {
  await server.init()
  await server.start()
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...')
  await server.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...')
  await server.stop()
  process.exit(0)
})

// Start the server
main().catch(console.error)
