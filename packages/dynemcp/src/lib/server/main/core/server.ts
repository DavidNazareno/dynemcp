import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { DyneMCPConfig } from '../../config/'
import type {
  ToolDefinition,
  PromptDefinition,
  SamplingRequest,
  SamplingResult,
} from '../../api'
import { registry } from '../../registry/core/registry'
import { loadConfig } from '../../config/core/loader'
import { createTransport, type Transport } from '../../communication'
import { registerComponents } from './initializer'
import { setCurrentDyneMCPInstance } from './server-instance'
import { TRANSPORT } from '../../../../global/config-all-contants'
import { fileLogger } from '../../../../global/logger'

// Main server class and logic for DyneMCP main module
// Handles server initialization, component loading, transport setup, and lifecycle management.

/**
 * DyneMCP: Main server class for the DyneMCP framework.
 * Use DyneMCP.create() to instantiate and manage the server lifecycle.
 */
export class DyneMCP {
  private server: McpServer
  private transport: Transport | undefined
  private isInitialized = false
  private config: DyneMCPConfig

  /**
   * Constructor privado. Usar DyneMCP.create() para instanciar.
   */
  private constructor(config: DyneMCPConfig) {
    this.config = config

    const serverConfig: any = {
      name: config.server.name,
      version: config.server.version,
    }
    if (
      'capabilities' in config.server &&
      (config.server as any).capabilities
    ) {
      serverConfig.capabilities = (config.server as any).capabilities
    }
    this.server = new McpServer(serverConfig)

    setCurrentDyneMCPInstance(this)
  }

  /**
   * Asynchronous factory to create a DyneMCP instance from config or path.
   */
  static async create(config?: DyneMCPConfig | string): Promise<DyneMCP> {
    const resolvedConfig: DyneMCPConfig =
      typeof config === 'string' || typeof config === 'undefined'
        ? await loadConfig(config)
        : config
    return new DyneMCP(resolvedConfig)
  }

  // =====================
  // Public methods
  // =====================

  /**
   * Returns the current server config.
   */
  getConfig(): DyneMCPConfig {
    return this.config
  }

  /**
   * Initializes the server and loads all components.
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    fileLogger.info('🚀 Inicializando DyneMCP server...')

    await registry.loadAll({
      tools: this.config.tools,
      resources: this.config.resources,
      prompts: this.config.prompts,
    })

    this.logLoadedComponents()

    // Register components in the MCP server
    registerComponents(this.server, this.tools, this.resources, this.prompts)

    this.isInitialized = true
    fileLogger.info('✅ DyneMCP server initialized correctly')
  }

  /**
   * Starts the MCP server and transport.
   */
  async start(): Promise<void> {
    await this.init()
    this.setupTransport()
    await this.connectTransport()
    this.logTransportInfo()
  }

  /**
   * Stops the MCP server and transport.
   */
  async stop(): Promise<void> {
    if (this.transport?.close) {
      await this.transport.close()
    }
    if (this.isCustomTransport()) {
      fileLogger.info('🛑 MCP server stopped')
    }
  }

  /**
   * Returns server statistics.
   */
  get stats() {
    return {
      ...registry.stats,
      server: {
        name: this.config.server.name,
        version: this.config.server.version,
      },
      transport: this.config.transport?.type || TRANSPORT.DEFAULT_TRANSPORT,
    }
  }

  /**
   * Returns registered tools.
   */
  get tools(): ToolDefinition[] {
    return registry.getAllTools().map((item) => item.module as ToolDefinition)
  }

  /**
   * Returns registered resources.
   */
  get resources() {
    return registry.getAllResources()
  }

  /**
   * Returns registered prompts.
   */
  get prompts(): PromptDefinition[] {
    return registry
      .getAllPrompts()
      .map((item) => item.module as PromptDefinition)
  }

  /**
   * Sends a sampling request to the server.
   */
  async sample(request: SamplingRequest): Promise<SamplingResult> {
    if (typeof (this.server as any).send !== 'function') {
      throw new Error('McpServer does not support send method')
    }
    return await (this.server as any).send('sampling/createMessage', request)
  }

  // =====================
  // Private methods
  // =====================

  /**
   * Logs all loaded components, filtering out invalid ones and warning if any are found.
   */
  private logLoadedComponents(): void {
    const tools = this.tools
    const resources = this.resources
    const prompts = this.prompts

    const validTools = tools.filter((t) => t && typeof t.name === 'string')
    const invalidTools = tools.length - validTools.length
    const validResources = resources.filter(
      (r) => r && typeof r.name === 'string'
    )
    const invalidResources = resources.length - validResources.length
    const validPrompts = prompts.filter((p) => p && typeof p.name === 'string')
    const invalidPrompts = prompts.length - validPrompts.length

    fileLogger.info(`Loaded tools: ${validTools.length}`)
    validTools.forEach((t) => fileLogger.info(`  - Tool: ${t.name}`))
    if (invalidTools > 0) {
      fileLogger.warn(
        `⚠️ ${invalidTools} invalid tool(s) were skipped (missing or invalid 'name')`
      )
    }

    fileLogger.info(`Loaded resources: ${validResources.length}`)
    validResources.forEach((r) => fileLogger.info(`  - Resource: ${r.name}`))
    if (invalidResources > 0) {
      fileLogger.warn(
        `⚠️ ${invalidResources} invalid resource(s) were skipped (missing or invalid 'name')`
      )
    }

    fileLogger.info(`Loaded prompts: ${validPrompts.length}`)
    validPrompts.forEach((p) => fileLogger.info(`  - Prompt: ${p.name}`))
    if (invalidPrompts > 0) {
      fileLogger.warn(
        `⚠️ ${invalidPrompts} invalid prompt(s) were skipped (missing or invalid 'name')`
      )
    }
  }

  /**
   * Initializes the transport based on config.
   */
  private setupTransport(): void {
    const transportConfig = this.config.transport || {
      type: TRANSPORT.DEFAULT_TRANSPORT,
    }
    this.transport = createTransport(transportConfig) as Transport
  }

  /**
   * Connects the transport to the MCP server.
   */
  private async connectTransport(): Promise<void> {
    if (
      this.transport &&
      'connect' in this.transport &&
      typeof (this.transport as any).connect === 'function'
    ) {
      await (this.transport as any).connect(this.server)
    } else if (
      this.transport &&
      'start' in this.transport &&
      typeof (this.transport as any).start === 'function'
    ) {
      await this.server.connect(this.transport)
    }
  }

  /**
   * Logs transport info after startup.
   */
  private logTransportInfo(): void {
    if (this.config.transport?.type !== TRANSPORT.TRANSPORT_TYPES.STDIO) {
      fileLogger.info(
        `🎯 MCP server "${this.config.server.name}" started successfully`
      )
      // Details of port and endpoint are shown in the HTTP transport
    }
  }

  /**
   * Checks if a custom transport is used.
   */
  private isCustomTransport(): boolean {
    return (
      this.config.transport?.type &&
      String(this.config.transport.type) !== 'stdio'
    )
  }
}

/**
 * Factory function to create a DyneMCP server instance (async).
 */
export async function createMCPServer(
  config?: DyneMCPConfig | string
): Promise<DyneMCP> {
  return DyneMCP.create(config)
}
