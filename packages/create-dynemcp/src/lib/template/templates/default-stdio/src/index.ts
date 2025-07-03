import { createMCPServer } from '@dynemcp/dynemcp'

// Create MCP server instance (puedes pasar './dynemcp.config.json' si quieres config explícito)
const serverPromise = createMCPServer()

async function main() {
  const server = await serverPromise
  await server.init()
  await server.start()
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...')
  const server = await serverPromise
  await server.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...')
  const server = await serverPromise
  await server.stop()
  process.exit(0)
})

// Start the server
main().catch(console.error)
