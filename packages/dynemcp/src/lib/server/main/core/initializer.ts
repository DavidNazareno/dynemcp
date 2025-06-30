import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../../api'
import type { ServerInitializationOptions } from './interfaces'
import { createTextResponse, createErrorResponse } from '../../api'

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
    server.registerTool(
      tool.name as string,
      {
        title: tool.name as string,
        description: tool.description as string | undefined,
        inputSchema: tool.inputSchema as any,
        annotations: tool.annotations as any,
      },
      async (args: Record<string, any>) => {
        try {
          const result = await tool.execute(args || {})
          if (
            result &&
            typeof result === 'object' &&
            Array.isArray((result as any).content)
          ) {
            const safeContent = (result as any).content.map((item: any) => {
              if (
                item &&
                typeof item === 'object' &&
                typeof item.type === 'string'
              ) {
                if (item.type === 'text' && typeof item.text === 'string') {
                  return { type: 'text', text: item.text }
                }
                // Aquí puedes agregar validaciones para otros tipos (image, audio, etc.)
              }
              return { type: 'text', text: JSON.stringify(item) }
            })
            return { ...result, content: safeContent }
          }
          return createTextResponse(String(result))
        } catch (error: any) {
          return createErrorResponse(
            error instanceof Error ? error : new Error(String(error))
          )
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
        const filteredArgs = Object.fromEntries(
          Object.entries(args).filter(([, value]) => value !== undefined)
        ) as Record<string, string>

        const messages = await prompt.getMessages(filteredArgs)
        // Valida y transforma cada mensaje para cumplir el contrato del SDK
        const safeMessages = Array.isArray(messages)
          ? messages.map((msg: any) => {
              const role: 'user' | 'assistant' =
                msg && (msg.role === 'user' || msg.role === 'assistant')
                  ? msg.role
                  : 'assistant'
              if (
                msg &&
                typeof msg === 'object' &&
                msg.content &&
                typeof msg.content === 'object' &&
                msg.content.type === 'text' &&
                typeof msg.content.text === 'string'
              ) {
                return {
                  role,
                  content: {
                    type: 'text',
                    text: msg.content.text as string,
                  } as {
                    type: 'text'
                    text: string
                  },
                }
              }
              // fallback: always return a valid text message
              return {
                role,
                content: {
                  type: 'text',
                  text: JSON.stringify(msg),
                } as {
                  type: 'text'
                  text: string
                },
              }
            })
          : []

        return {
          messages: safeMessages,
          description: prompt.description,
        }
      }
    )
  }
}

/**
 * Register tools, resources, and prompts with the MCP server.
 */
export function registerComponents(
  server: McpServer,
  tools: ToolDefinition[],
  resources: ResourceDefinition[],
  prompts: PromptDefinition[]
): void {
  registerTools(server, tools)
  registerResources(server, resources)
  registerPrompts(server, prompts)
}
