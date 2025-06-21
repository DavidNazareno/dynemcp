import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../interfaces.js'

export interface ServerInitializationOptions {
  name: string
  version: string
  documentationUrl?: string
}

export function createMCPServerInstance(
  options: ServerInitializationOptions
): McpServer {
  return new McpServer({
    name: options.name,
    version: options.version,
    documentationUrl: options.documentationUrl,
  })
}

export function registerTools(
  server: McpServer,
  tools: ToolDefinition[]
): void {
  for (const tool of tools) {
    server.tool(tool.name, tool.description, tool.schema, tool.handler)
  }
}

export function registerResources(
  server: McpServer,
  resources: ResourceDefinition[]
): void {
  for (const resource of resources) {
    const handler = async () => {
      const content =
        typeof resource.content === 'function'
          ? await resource.content()
          : resource.content
      return {
        content: [{ type: 'text' as const, text: content }],
      }
    }

    server.tool(
      `resource:${resource.uri}`,
      resource.description || `Resource: ${resource.name}`,
      {},
      handler
    )
  }
}

export function registerPrompts(
  server: McpServer,
  prompts: PromptDefinition[]
): void {
  for (const prompt of prompts) {
    server.tool(
      `prompt:${prompt.id}`,
      prompt.description || `Prompt: ${prompt.name}`,
      {},
      async () => {
        return {
          content: [{ type: 'text' as const, text: prompt.content }],
        }
      }
    )
  }
}
