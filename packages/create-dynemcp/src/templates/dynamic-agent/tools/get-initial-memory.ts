import { z } from 'zod'
import type { ToolDefinition, CallToolResult } from '@dynemcp/dynemcp'

const getInitialMemoryTool: ToolDefinition = {
  name: 'get-initial-memory',
  description: 'Gets initial memory contents for the agent',
  inputSchema: {},
  annotations: {
    title: 'Get Initial Memory',
    readOnlyHint: true,
    openWorldHint: false,
  },
  async execute(): Promise<CallToolResult> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              memory: {
                activeTools: [],
                sessionStart: new Date().toISOString(),
                capabilities: ['dynamic-learning', 'tool-registration'],
              },
            },
            null,
            2
          ),
        },
      ],
    }
  },
}

export default getInitialMemoryTool
