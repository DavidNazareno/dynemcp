import { createMCPServer } from '@dynemcp/dynemcp/server'
import { z } from 'zod'

async function main() {
  const server = createMCPServer()
  await server.start()

  console.log('Agent started. I will learn a new tool in 10 seconds.')

  // Dynamic Registration Example
  setTimeout(() => {
    console.log('Learning "get-system-load"...')
    server.registry.addTool({
      name: 'get-system-load',
      description: 'Gets the current system CPU load.',
      schema: z.object({}),
      handler: async () => ({ load: `${(Math.random() * 100).toFixed(2)}%` }),
    })
    console.log('Tool learned!')
  }, 10000)

  // Sampling Example
  setInterval(async () => {
    if (server.registry.getAllTools().length === 0) {
      // Don't sample if no tools are available yet
      return
    }
    try {
      console.log('\nAsking model to check system status...')
      const response = await server.sample({
        content: [
          {
            type: 'text',
            text: 'Use your tools to tell me the system status.',
          },
        ],
      })
      const textResponse = response.content.find((c) => c.type === 'text')?.text
      console.log(`Model says: "${textResponse}"`)
    } catch (e) {
      console.error('Failed to sample model:', e)
    }
  }, 20000)
}

main()
