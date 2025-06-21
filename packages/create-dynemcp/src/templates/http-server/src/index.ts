import { createMCPServer } from '@dynemcp/dynemcp/server'

async function main() {
  const server = createMCPServer()
  await server.start()
}

main()
