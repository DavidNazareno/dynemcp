/**
 * Core de DyneMCP - Envoltorio para el SDK oficial de MCP
 */

// @ts-expect-error - El SDK puede no tener tipos correctamente definidos
import { Server } from '@modelcontextprotocol/sdk/server'
// @ts-expect-error - El SDK puede no tener tipos correctamente definidos
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'
import { z } from 'zod'
import { loadConfig, DyneMCPConfig } from './config'

export interface ToolDefinition {
  name: string
  description: string
  schema: Record<string, z.ZodType>
  handler: (params: any) => Promise<any> | any
}

export interface ResourceDefinition {
  uri: string
  name: string
  content: string | (() => string | Promise<string>)
  description?: string
  contentType?: string
}

export interface PromptDefinition {
  id: string
  name: string
  content: string
  description?: string
}

// Clase principal de DyneMCP
export class DyneMCP {
  private server: Server
  private tools: ToolDefinition[] = []
  private resources: ResourceDefinition[] = []
  private prompts: PromptDefinition[] = []
  private config: DyneMCPConfig

  /**
   * Crea una nueva instancia de DyneMCP
   *
   * @param name - Nombre del servidor
   * @param version - Versión del servidor
   */
  constructor(name: string, version: string = '1.0.0') {
    this.server = new Server({
      name,
      version,
    })
    this.config = {
      server: {
        name,
        version,
      },
      tools: {
        autoRegister: true,
      },
      resources: {
        autoRegister: true,
      },
      prompts: {
        autoRegister: true,
      },
    }
  }

  /**
   * Inicializa el servidor con la configuración
   *
   * @param configPath - Ruta al archivo de configuración
   */
  async init(configPath?: string): Promise<void> {
    this.config = await loadConfig(configPath)
  }

  /**
   * Registra una herramienta en el servidor
   *
   * @param tool - Definición de la herramienta
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.push(tool)

    this.server.tool(tool.name, tool.description, tool.schema, tool.handler)
  }

  /**
   * Registra múltiples herramientas en el servidor
   *
   * @param tools - Array de definiciones de herramientas
   */
  registerTools(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.registerTool(tool)
    }
  }

  /**
   * Registra un recurso en el servidor
   *
   * @param resource - Definición del recurso
   */
  registerResource(resource: ResourceDefinition): void {
    this.resources.push(resource)

    const handler = async (_args: any, _extra: any) => {
      const content =
        typeof resource.content === 'function'
          ? await resource.content()
          : resource.content

      return {
        content: [
          {
            type: 'text' as const,
            text: content,
          },
        ],
      }
    }

    // Usamos un objeto vacío para el esquema de parámetros
    this.server.tool(
      `resource:${resource.uri}`,
      resource.description || `Resource: ${resource.name}`,
      {},
      handler
    )
  }

  /**
   * Registra múltiples recursos en el servidor
   *
   * @param resources - Array de definiciones de recursos
   */
  registerResources(resources: ResourceDefinition[]): void {
    for (const resource of resources) {
      this.registerResource(resource)
    }
  }

  /**
   * Registra un prompt en el servidor
   *
   * @param prompt - Definición del prompt
   */
  registerPrompt(prompt: PromptDefinition): void {
    this.prompts.push(prompt)

    // Registrar el prompt en el servidor MCP
    // Similar a los recursos, implementamos como una herramienta
    this.server.tool(
      `prompt:${prompt.id}`,
      prompt.description || `Prompt: ${prompt.name}`,
      {},
      async (_args: any, _extra: any) => {
        return {
          content: [
            {
              type: 'text' as const,
              text: prompt.content,
            },
          ],
        }
      }
    )
  }

  /**
   * Registra múltiples prompts en el servidor
   *
   * @param prompts - Array de definiciones de prompts
   */
  registerPrompts(prompts: PromptDefinition[]): void {
    for (const prompt of prompts) {
      this.registerPrompt(prompt)
    }
  }

  /**
   * Inicia el servidor MCP
   */
  async start(): Promise<void> {
    // Por defecto, usar stdio
    const transport = new StdioServerTransport()

    // Conectar el servidor al transporte
    await this.server.connect(transport)
    console.log('Servidor MCP iniciado correctamente')
  }

  /**
   * Detiene el servidor MCP
   */
  async stop(): Promise<void> {
    // El SDK actual no tiene un método directo para detener el servidor
    console.log('Deteniendo servidor MCP...')
    // Implementar lógica de cierre si es necesario
  }

  /**
   * Devuelve todas las herramientas registradas
   */
  get registeredTools(): ToolDefinition[] {
    return [...this.tools]
  }

  /**
   * Devuelve todos los recursos registrados
   */
  get registeredResources(): ResourceDefinition[] {
    return [...this.resources]
  }

  /**
   * Devuelve todos los prompts registrados
   */
  get registeredPrompts(): PromptDefinition[] {
    return [...this.prompts]
  }
}

/**
 * Crea una nueva instancia de DyneMCP
 *
 * @param name - Nombre del servidor
 * @param version - Versión del servidor
 * @returns Nueva instancia de DyneMCP
 */
export function createMCPServer(
  name: string,
  version: string = '1.0.0'
): DyneMCP {
  return new DyneMCP(name, version)
}
