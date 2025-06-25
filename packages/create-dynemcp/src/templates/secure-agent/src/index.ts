import { createMCPServer } from '@dynemcp/dynemcp/server'

async function main() {
  const server = createMCPServer()
  await server.start()
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down secure server...')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down secure server...')
  process.exit(0)
})

main().catch(console.error)
