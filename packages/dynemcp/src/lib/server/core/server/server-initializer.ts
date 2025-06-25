import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  GetPromptResponse,
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
        contents: [
          {
            uri: resource.uri,
            text: content,
            mimeType: resource.contentType || 'text/plain',
          },
        ],
      }
    }

    server.resource(
      resource.name,
      resource.uri,
      { description: resource.description },
      handler
    )
  }
}

export function registerPrompts(
  server: McpServer,
  prompts: PromptDefinition[]
): void {
  for (const prompt of prompts) {
    const argsSchema = prompt.arguments?.reduce(
      (acc, arg) => ({
        ...acc,
        [arg.name]: arg.required ? z.string() : z.string().optional(),
      }),
      {} as Record<string, z.ZodString | z.ZodOptional<z.ZodString>>
    )

    if (argsSchema && Object.keys(argsSchema).length > 0) {
      server.prompt(
        prompt.name,
        prompt.description || `Prompt: ${prompt.name}`,
        argsSchema,
        async (args): Promise<GetPromptResponse> => {
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
    } else {
      server.prompt(
        prompt.name,
        prompt.description || `Prompt: ${prompt.name}`,
        async (): Promise<GetPromptResponse> => {
          const messages = await prompt.getMessages()
          return {
            messages,
            description: prompt.description,
          }
        }
      )
    }
  }
}
