import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { DyneMCPConfig } from '../config.js'
import {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  ServerConfig,
} from '../interfaces.js'
import { loadConfig } from '../config.js'
import { registry } from '../registry/registry.js'
import { createTransport } from '../../transport/index.js'
import {
  createMCPServerInstance,
  registerTools,
  registerResources,
  registerPrompts,
} from './server-initializer.js'

export class DyneMCP {
  private server: McpServer
  private config: DyneMCPConfig
  private isInitialized = false
  private transport?: any

  public readonly registry = registry

  constructor(name?: string, configPath?: string, version?: string) {
    this.config = loadConfig(configPath)

    // Override config with constructor parameters
    if (name) this.config.server.name = name
    if (version) this.config.server.version = version

    this.server = createMCPServerInstance({
      ...(this.config.server as ServerConfig),
    })
  }

  /**
   * Get the current server configuration
   */
  getConfig(): DyneMCPConfig {
    return this.config
  }

  /**
   * Helper for debug logging to STDERR if DYNE_MCP_DEBUG_STDERR=1
   */
  private debugLog(msg: string) {
    if (process.env.DYNE_MCP_DEBUG_STDERR === '1') {
      console.error(msg)
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
    registerTools(this.server, tools)
    registerResources(this.server, resources)
    registerPrompts(this.server, prompts)

    this.isInitialized = true
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.log('✅ DyneMCP server initialized successfully')
    }
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    await this.init()

    // Create and connect transport
    const transportConfig = this.config.transport || { type: 'stdio' }
    this.transport = createTransport(transportConfig)
    await this.transport.connect(this.server)

    // Solo mostrar logs si el transporte NO es stdio
    if (transportConfig.type !== 'stdio') {
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
    if (this.config.transport?.type !== 'stdio') {
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
      transport: this.config.transport?.type || 'stdio',
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
