import { DyneMCPTool, CallToolResult } from '@dynemcp/dynemcp'
import { z } from 'zod'

const GetInitialMemorySchema = z.object({
  format: z
    .enum(['json', 'summary', 'detailed'])
    .optional()
    .describe('Output format for memory data'),
  includeCapabilities: z
    .boolean()
    .optional()
    .describe('Whether to include capability details'),
})

export class GetInitialMemoryTool extends DyneMCPTool {
  readonly name = 'get-initial-memory'
  readonly description = 'Gets initial memory contents and capabilities for the dynamic agent'
  readonly inputSchema = GetInitialMemorySchema.shape
  readonly annotations = {
    title: 'Get Initial Memory',
    readOnlyHint: true,
    openWorldHint: false,
  }

  execute(input: z.infer<typeof GetInitialMemorySchema>): CallToolResult {
    const { format = 'json', includeCapabilities = true } = input
    
    const sessionStart = new Date().toISOString()
    const capabilities = [
      'dynamic-learning',
      'tool-registration',
      'memory-management',
      'adaptive-responses',
    ]

    const memoryData = {
      memory: {
        activeTools: ['get-initial-memory'],
        sessionStart,
        capabilities: includeCapabilities ? capabilities : undefined,
        agent: {
          type: 'dynamic',
          version: '1.0.0',
          lastUpdate: sessionStart,
        },
        settings: {
          learningEnabled: true,
          memoryPersistence: false,
          adaptiveMode: true,
        },
      },
    }

    switch (format) {
      case 'summary':
        return {
          content: [
            {
              type: 'text',
              text: `Dynamic Agent Memory Summary:
- Session started: ${sessionStart}
- Active tools: ${memoryData.memory.activeTools.length}
- Capabilities: ${capabilities.length} enabled
- Learning mode: ${memoryData.memory.settings.learningEnabled ? 'ON' : 'OFF'}`,
            },
          ],
        }

      case 'detailed':
        return {
          content: [
            {
              type: 'text',
              text: `# Dynamic Agent Memory Report

## Session Information
- Start Time: ${sessionStart}
- Agent Type: Dynamic Learning Agent
- Version: 1.0.0

## Current State
- Active Tools: ${memoryData.memory.activeTools.join(', ')}
- Learning Enabled: ${memoryData.memory.settings.learningEnabled}
- Memory Persistence: ${memoryData.memory.settings.memoryPersistence}
- Adaptive Mode: ${memoryData.memory.settings.adaptiveMode}

## Capabilities
${capabilities.map((cap) => `- ${cap}`).join('\n')}

## Status
System initialized and ready for dynamic operations.`,
            },
          ],
        }

      case 'json':
      default:
        return {
          content: [{ type: 'text', text: JSON.stringify(memoryData, null, 2) }],
        }
    }
  }
}

export default new GetInitialMemoryTool()
