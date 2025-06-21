import { z } from 'zod'
import { ToolDefinition } from '@dynemcp/dynemcp'

const GetInitialMemorySchema = z.object({})

// Get memory usage once at startup and reuse it
const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024

const getInitialMemoryTool: ToolDefinition = {
  name: 'get-initial-memory-usage',
  description: 'Gets the memory usage of the agent process at startup.',
  schema: GetInitialMemorySchema,
  handler: async () => {
    return `Initial memory usage was: ${initialMemoryUsage.toFixed(2)} MB`
  },
}

export default getInitialMemoryTool
