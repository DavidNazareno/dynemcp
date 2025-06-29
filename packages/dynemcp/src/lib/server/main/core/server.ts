import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { DyneMCPConfig } from '../../config/core/interfaces.js'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../../api/core/interfaces.js'
import { registry } from '../../registry/core/registry.js'
import { loadConfig } from '../../config/core/loader.js'
import { createTransport, TRANSPORT_TYPES } from '../../communication/index.js'
import { logMsg } from './utils.js'
import { registerComponents } from './initializer.js'

export class DyneMCP {
  private server: McpServer
  private transport: any
  private isInitialized = false
  private config: DyneMCPConfig

  /**
   * Use DyneMCP.create() for async construction.
   */
  private constructor(config: DyneMCPConfig) {
    this.config = config
    const serverConfig: any = {
      name: config.server.name,
      version: config.server.version,
    }
    if ('capabilities' in config.server && config.server.capabilities) {
      serverConfig.capabilities = config.server.capabilities
    }
    this.server = new McpServer(serverConfig)
  }

  /**
   * Async factory for DyneMCP, supports config path or object.
   */
  static async create(config?: DyneMCPConfig | string): Promise<DyneMCP> {
    let resolvedConfig: DyneMCPConfig
    if (typeof config === 'string' || typeof config === 'undefined') {
      resolvedConfig = await loadConfig(config)
    } else {
      resolvedConfig = config
    }
    return new DyneMCP(resolvedConfig)
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

    // LOG: Show how many and which tools/resources/prompts were loaded
    const tools = registry
      .getAllTools()
      .map((item) => item.module as ToolDefinition)
    const resources = registry
      .getAllResources()
      .map((item) => item.module as ResourceDefinition)
    const prompts = registry
      .getAllPrompts()
      .map((item) => item.module as PromptDefinition)
    // Use logMsg helper
    logMsg(`Loaded tools: ${tools.length}`, this.debugLog.bind(this))
    if (tools.length > 0) {
      tools.forEach((t) =>
        logMsg(`  - Tool: ${t.name}`, this.debugLog.bind(this))
      )
    }
    logMsg(`Loaded resources: ${resources.length}`, this.debugLog.bind(this))
    if (resources.length > 0) {
      resources.forEach((r) =>
        logMsg(`  - Resource: ${r.name}`, this.debugLog.bind(this))
      )
    }
    logMsg(`Loaded prompts: ${prompts.length}`, this.debugLog.bind(this))
    if (prompts.length > 0) {
      prompts.forEach((p) =>
        logMsg(`  - Prompt: ${p.name}`, this.debugLog.bind(this))
      )
    }

    // Register components with MCP server
    registerComponents(this.server, tools, resources, prompts)

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
    const transportConfig = this.config.transport || {
      type: TRANSPORT_TYPES[0],
    }
    this.transport = createTransport(transportConfig)
    if (typeof this.transport.connect === 'function') {
      await this.transport.connect(this.server)
    }
    // Only log if transport is not stdio
    if (String(transportConfig.type) !== 'stdio') {
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
    // Only log if transport is not stdio
    if (
      this.config.transport?.type &&
      String(this.config.transport.type) !== 'stdio'
    ) {
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
      transport: this.config.transport?.type || TRANSPORT_TYPES[0],
    }
  }

  /**
   * Get all registered tools
   */
  get tools(): ToolDefinition[] {
    return registry.getAllTools().map((item) => item.module as ToolDefinition)
  }

  /**
   * Get all registered resources
   */
  get resources(): ResourceDefinition[] {
    return registry
      .getAllResources()
      .map((item) => item.module as ResourceDefinition)
  }

  /**
   * Get all registered prompts
   */
  get prompts(): PromptDefinition[] {
    return registry
      .getAllPrompts()
      .map((item) => item.module as PromptDefinition)
  }
}

/**
 * Async factory for DyneMCP server instance
 */
export async function createMCPServer(
  config?: DyneMCPConfig | string
): Promise<DyneMCP> {
  return DyneMCP.create(config)
}
