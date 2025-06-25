import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
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
  // Register tools using the modern MCP SDK API
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      async (args: Record<string, any>) => {
        try {
          return await tool.execute(args || {})
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: error instanceof Error ? error.message : String(error),
              },
            ],
          }
        }
      }
    )
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
        contents: [
          {
            uri: resource.uri,
            text: content,
            mimeType: resource.contentType || 'text/plain',
          },
        ],
      }
    }

    server.registerResource(
      resource.name,
      resource.uri,
      {
        title: resource.name,
        description: resource.description,
      },
      handler
    )
  }
}

export function registerPrompts(
  server: McpServer,
  prompts: PromptDefinition[]
): void {
  for (const prompt of prompts) {
    // Convert prompt arguments to Zod schema
    const argsSchema = prompt.arguments?.reduce(
      (acc, arg) => ({
        ...acc,
        [arg.name]: arg.required ? z.string() : z.string().optional(),
      }),
      {} as Record<string, z.ZodString | z.ZodOptional<z.ZodString>>
    )

    server.registerPrompt(
      prompt.name,
      {
        title: prompt.name,
        description: prompt.description || `Prompt: ${prompt.name}`,
        argsSchema: argsSchema,
      },
      async (args: { [x: string]: string | undefined }) => {
        // Filter out undefined values to match the expected type
        const filteredArgs = Object.fromEntries(
          Object.entries(args).filter(([, value]) => value !== undefined)
        ) as Record<string, string>

        const messages = await prompt.getMessages(filteredArgs)
        return {
          messages,
          description: prompt.description,
        }
      }
    )
  }
}
