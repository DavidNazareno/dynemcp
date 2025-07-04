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
import {
  createTransport,
  TRANSPORT_TYPES,
  type Transport,
} from '../../communication'
import { logMsg } from './utils'
import { registerComponents } from './initializer'
import { setCurrentDyneMCPInstance } from './server-instance'

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

    this.log('🚀 Inicializando DyneMCP server...')

    await registry.loadAll({
      tools: this.config.tools,
      resources: this.config.resources,
      prompts: this.config.prompts,
      // resourceTemplates se cargan automáticamente desde las carpetas de resources
    })

    this.logLoadedComponents()

    // Registrar componentes en el servidor MCP
    registerComponents(this.server, this.tools, this.resources, this.prompts)

    this.isInitialized = true
    this.log('✅ DyneMCP server inicializado correctamente')
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
      this.log('🛑 MCP server detenido')
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
      transport: this.config.transport?.type || TRANSPORT_TYPES[0],
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
   * Debug log if DYNE_MCP_DEBUG=1
   */
  private debugLog(msg: string): void {
    if (process.env.DYNE_MCP_DEBUG) {
      console.error(`[DEBUG] ${msg}`)
    }
  }

  /**
   * Standard log if not silenced
   */
  private log(msg: string): void {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.log(msg)
    }
  }

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

    logMsg(`Loaded tools: ${validTools.length}`, this.debugLog.bind(this))
    validTools.forEach((t) =>
      logMsg(`  - Tool: ${t.name}`, this.debugLog.bind(this))
    )
    if (invalidTools > 0) {
      logMsg(
        `⚠️ ${invalidTools} invalid tool(s) were skipped (missing or invalid 'name')`,
        this.debugLog.bind(this)
      )
    }

    logMsg(
      `Loaded resources: ${validResources.length}`,
      this.debugLog.bind(this)
    )
    validResources.forEach((r) =>
      logMsg(`  - Resource: ${r.name}`, this.debugLog.bind(this))
    )
    if (invalidResources > 0) {
      logMsg(
        `⚠️ ${invalidResources} invalid resource(s) were skipped (missing or invalid 'name')`,
        this.debugLog.bind(this)
      )
    }

    logMsg(`Loaded prompts: ${validPrompts.length}`, this.debugLog.bind(this))
    validPrompts.forEach((p) =>
      logMsg(`  - Prompt: ${p.name}`, this.debugLog.bind(this))
    )
    if (invalidPrompts > 0) {
      logMsg(
        `⚠️ ${invalidPrompts} invalid prompt(s) were skipped (missing or invalid 'name')`,
        this.debugLog.bind(this)
      )
    }
  }

  /**
   * Initializes the transport based on config.
   */
  private setupTransport(): void {
    const transportConfig = this.config.transport || {
      type: TRANSPORT_TYPES[0],
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
    const roots = registry.getAllRoots()
    if (
      roots &&
      roots.length > 0 &&
      this.transport &&
      typeof this.transport.send === 'function'
    ) {
      await this.transport.send({
        jsonrpc: '2.0',
        method: 'roots/didChange',
        params: { roots },
      })
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.log(`\n🌱 Notified roots/didChange (${roots.length})`)
      }
    }
  }

  /**
   * Logs transport info after startup.
   */
  private logTransportInfo(): void {
    const transportConfig = this.config.transport || {
      type: TRANSPORT_TYPES[0],
    }
    if (String(transportConfig.type) !== 'stdio') {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.log(
          `🎯 MCP server "${this.config.server.name}" started successfully`
        )
        // Detalles de puerto y endpoint se muestran en el transport HTTP
      }
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
