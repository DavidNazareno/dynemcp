import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  PromptMessage,
} from '../../api'
import type { ServerInitializationOptions } from './interfaces'
import { createTextResponse, createErrorResponse } from '../../api'
import type { DyneMCPConfig } from '../../config/core/interfaces'
import { loadConfig } from '../../config/core/loader'
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

// Utility to normalize names (e.g. "greeter Good" -> "greeter_good")
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // replace symbols and spaces with _
    .replace(/^_+|_+$/g, '') // remove _ at start/end
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
      normalizeName(tool.name),
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
                  // Here you can add validations for other types (image, audio, etc.)
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
      normalizeName(resource.name),
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
      normalizeName(prompt.name),
      {
        title: prompt.name,
        description: prompt.description || `Prompt: ${prompt.name}`,
        argsSchema,
      },
      async (args: Record<string, string | undefined>) => {
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
                // fallback: always returns a valid text message
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
 * Ahora usa el registry como única fuente de componentes.
 */
export async function registerComponents(
  server: McpServer,
  config?: DyneMCPConfig
): Promise<void> {
  // Siempre usamos el registry para cargar y obtener los componentes
  if (!registry.loaded) {
    let resolvedConfig: DyneMCPConfig
    if (!config) {
      resolvedConfig = await loadConfig()
    } else {
      resolvedConfig = config
    }
    await registry.loadAll({
      tools: resolvedConfig.tools,
      resources: resolvedConfig.resources,
      prompts: resolvedConfig.prompts,
    })
  }
  // Obtenemos los componentes del registry
  const tools = registry.getAllTools().map((item) => item.module)
  const resources = registry.getAllResources().map((item) => item.module)
  const prompts = registry.getAllPrompts().map((item) => item.module)

  registerTools(server, tools)
  registerResources(server, resources)
  registerPrompts(server, prompts)
}

// TODO: Resource template initializer logic removed for production release. Re-implement in a future version if needed.
