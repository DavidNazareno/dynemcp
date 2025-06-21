import { z } from 'zod'
import { ToolDefinition } from '@dynemcp/dynemcp'

const GetAgentStatusSchema = z.object({})

const getAgentStatusTool: ToolDefinition = {
  name: 'get-agent-status',
  description: 'Checks the current status of the secure agent.',
  schema: GetAgentStatusSchema,
  handler: async () => {
    return {
      status: 'ok',
      message: 'All systems are operational.',
      timestamp: new Date().toISOString(),
    }
  },
}

export default getAgentStatusTool
