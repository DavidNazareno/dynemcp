import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  PromptMessage,
  ResourceTemplateDefinition,
} from '../../api'
import type { ServerInitializationOptions } from './interfaces'
import { createTextResponse, createErrorResponse } from '../../api'
import { registry } from '../../registry/core/registry'

// Server initializer logic for DyneMCP main module
// Handles registration of tools, resources, and prompts with the MCP server instance.

/**
 * Creates a new MCP server instance with the provided options.
 */
export function createMCPServerInstance(
  options: ServerInitializationOptions
): McpServer {
  return new McpServer({
    name: options.name,
    version: options.version,
    documentationUrl: options.documentationUrl,
  })
}

/**
 * Registers all tools with the MCP server.
 */
export function registerTools(
  server: McpServer,
  tools: ToolDefinition[]
): void {
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.name,
        description: tool.description,
        inputSchema: (tool as any).inputSchema,
        annotations: (tool as any).annotations,
      },
      async (args: Record<string, unknown>) => {
        try {
          const result = await (tool as any).execute(args || {})
          if (
            result &&
            typeof result === 'object' &&
            Array.isArray((result as { content?: unknown[] }).content)
          ) {
            // Sanitiza el contenido para asegurar que cada item tenga el formato correcto
            const safeContent = (result as { content: unknown[] }).content.map(
              (item) => {
                if (
                  item &&
                  typeof item === 'object' &&
                  'type' in item &&
                  typeof (item as any).type === 'string'
                ) {
                  if (
                    (item as any).type === 'text' &&
                    typeof (item as any).text === 'string'
                  ) {
                    return { type: 'text', text: (item as any).text }
                  }
                  // Aquí puedes agregar validaciones para otros tipos (image, audio, etc.)
                }
                return { type: 'text', text: JSON.stringify(item) }
              }
            )
            return { ...result, content: safeContent }
          }
          return createTextResponse(String(result))
        } catch (error) {
          return createErrorResponse(
            error instanceof Error ? error : new Error(String(error))
          )
        }
      }
    )
  }
}

/**
 * Registers all resources with the MCP server.
 */
export function registerResources(
  server: McpServer,
  resources: ResourceDefinition[]
): void {
  for (const resource of resources) {
    const handler = async () => {
      let content =
        typeof resource.content === 'function'
          ? await resource.content()
          : resource.content

      if (content === undefined || content === null) {
        content = ''
      }

      return {
        contents: [
          {
            uri: resource.uri,
            text: content,
            mimeType:
              (resource as any).mimeType ||
              resource.contentType ||
              'text/plain',
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

/**
 * Registers all prompts with the MCP server.
 */
export function registerPrompts(
  server: McpServer,
  prompts: PromptDefinition[]
): void {
  for (const prompt of prompts) {
    // Construye el esquema de argumentos para el prompt
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
        argsSchema,
      },
      async (args: Record<string, string | undefined>, _extra: unknown) => {
        // Filtra los argumentos undefined
        const filteredArgs = Object.fromEntries(
          Object.entries(args).filter(([, value]) => value !== undefined)
        ) as Record<string, string>

        const messages: PromptMessage[] = await (prompt as any).getMessages(
          filteredArgs
        )
        // Valida y transforma cada mensaje para cumplir el contrato del SDK
        const safeMessages = (
          Array.isArray(messages)
            ? messages.map((msg) => {
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
                      text: msg.content.text,
                      _meta: {} as { [x: string]: unknown },
                    },
                  }
                }
                // fallback: siempre retorna un mensaje de texto válido
                return {
                  role,
                  content: {
                    type: 'text',
                    text: JSON.stringify(msg),
                    _meta: {} as { [x: string]: unknown },
                  },
                }
              })
            : []
        ) as Array<{
          role: 'user' | 'assistant'
          content: {
            type: 'text'
            text: string
            _meta?: { [x: string]: unknown }
          }
        }>

        return {
          messages: safeMessages,
          description: prompt.description,
        } as {
          messages: Array<{
            role: 'user' | 'assistant'
            content: {
              type: 'text'
              text: string
              _meta?: { [x: string]: unknown }
            }
          }>
          description: string
        }
      }
    )
  }
}

/**
 * Registers tools, resources, and prompts with the MCP server (main entrypoint).
 */
export function registerComponents(
  server: McpServer,
  tools: ToolDefinition[],
  resources: ResourceDefinition[],
  prompts: PromptDefinition[],
  resourceTemplates: ResourceTemplateDefinition[] = []
): void {
  registerTools(server, tools)
  const realResources = registry.getAllResourceObjects()
  registerResources(server, realResources)
  registerPrompts(server, prompts)
}

// TODO: Resource template initializer logic removed for production release. Re-implement in a future version if needed.
