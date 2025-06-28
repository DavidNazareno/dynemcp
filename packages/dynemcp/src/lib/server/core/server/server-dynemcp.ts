import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { DyneMCPConfig } from '../../config/interfaces.js'
import {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../interfaces.js'
import { registry } from '../registry/registry.js'
import { CLI } from '../../../../global/config-all-contants.js'
import { loadConfig } from '../../config/core/loader.js'
import { createTransport } from '../../transport/index.js'

export class DyneMCP {
  private server: McpServer
  private transport: any
  private isInitialized: boolean = false
  private config: DyneMCPConfig

  constructor(config?: DyneMCPConfig | string) {
    this.config =
      typeof config === 'string' ? loadConfig(config) : config || loadConfig()
    this.server = new McpServer()
  }

  /**
   * Get the current server configuration
   */
  getConfig(): DyneMCPConfig {
    return this.config
  }

  /**
   * Helper for debug logging to STDERR if DYNE_MCP_DEBUG=1
   */
  private debugLog(msg: string): void {
    if (process.env.DYNE_MCP_DEBUG) {
      console.error(`[DEBUG] ${msg}`)
    }
  }

  /**
   * Initialize the server and load all components
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.log('🚀 Initializing DyneMCP server...')
    }

    // Load all components using unified registry
    await registry.loadAll({
      tools: this.config.tools,
      resources: this.config.resources,
      prompts: this.config.prompts,
    })

    // LOG: Mostrar cuántos y cuáles tools/resources/prompts se han cargado
    const tools = registry.getAllTools()
    const resources = registry.getAllResources()
    const prompts = registry.getAllPrompts()
    // Siempre mostrar por STDERR si debug, y por STDOUT si no está silenciado
    const logMsg = (msg: string) => {
      this.debugLog(msg)
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.log(msg)
      }
    }
    logMsg(`Loaded tools: ${tools.length}`)
    if (tools.length > 0) {
      tools.forEach((t) => logMsg(`  - Tool: ${t.name}`))
    }
    logMsg(`Loaded resources: ${resources.length}`)
    if (resources.length > 0) {
      resources.forEach((r) => logMsg(`  - Resource: ${r.name}`))
    }
    logMsg(`Loaded prompts: ${prompts.length}`)
    if (prompts.length > 0) {
      prompts.forEach((p) => logMsg(`  - Prompt: ${p.name}`))
    }

    // Register components with MCP server
    this.registerComponents(tools, resources, prompts)

    this.isInitialized = true
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.log('✅ DyneMCP server initialized successfully')
    }
  }

  private registerComponents(
    tools: ToolDefinition[],
    resources: ResourceDefinition[],
    prompts: PromptDefinition[]
  ): void {
    tools.forEach((tool) => {
      this.server.registerTool(tool.name, tool.handler)
    })

    resources.forEach((resource) => {
      this.server.registerResource(resource.name, resource.handler)
    })

    prompts.forEach((prompt) => {
      this.server.registerPrompt(prompt.name, prompt.handler)
    })
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    await this.init()

    // Create and connect transport
    const transportConfig = this.config.transport || {
      type: CLI.TRANSPORT_TYPES[0],
    } // 'stdio'
    this.transport = createTransport(transportConfig)
    await this.transport.connect(this.server)

    // Solo mostrar logs si el transporte NO es stdio
    if (transportConfig.type !== CLI.TRANSPORT_TYPES[0]) {
      // not 'stdio'
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.log(
          `🎯 MCP server "${this.config.server.name}" started successfully`
        )
        console.log(`📡 Transport: ${transportConfig.type}`)
        const options = (transportConfig as any).options
        if (options?.port) {
          console.log(`🌐 Server listening on port ${options.port}`)
        }
      }
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (this.transport?.disconnect) {
      await this.transport.disconnect()
    }
    // Solo mostrar log si el transporte NO es stdio
    if (this.config.transport?.type !== CLI.TRANSPORT_TYPES[0]) {
      // not 'stdio'
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.log('🛑 MCP server stopped')
      }
    }
  }

  /**
   * Get server statistics
   */
  get stats() {
    return {
      ...registry.stats,
      server: {
        name: this.config.server.name,
        version: this.config.server.version,
      },
      transport: this.config.transport?.type || CLI.TRANSPORT_TYPES[0], // 'stdio'
    }
  }

  /**
   * Get all registered tools
   */
  get tools(): ToolDefinition[] {
    return registry.getAllTools()
  }

  /**
   * Get all registered resources
   */
  get resources(): ResourceDefinition[] {
    return registry.getAllResources()
  }

  /**
   * Get all registered prompts
   */
  get prompts(): PromptDefinition[] {
    return registry.getAllPrompts()
  }
}

/**
 * Create a new DyneMCP server instance
 */
export function createMCPServer(
  name?: string,
  configPath?: string,
  version?: string
): DyneMCP {
  return new DyneMCP(name, configPath, version)
}
