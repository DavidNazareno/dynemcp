import { createMCPServer } from '@dynemcp/dynemcp'

// Create MCP server
const serverPromise = createMCPServer()

async function main() {
  const server = await serverPromise
  await server.init()
  await server.start()
}

main().catch(console.error)
