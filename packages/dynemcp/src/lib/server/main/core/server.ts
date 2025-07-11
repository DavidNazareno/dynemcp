import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { DyneMCPConfig } from '../../config/'
import type {
  ToolDefinition,
  PromptDefinition,
  SamplingRequest,
  SamplingResult,
  ResourceDefinition,
} from '../../api'
import { registry } from '../../registry/core/registry'
import { loadConfig } from '../../config/core/loader'
import { type Transport } from '../../communication'
import { registerComponents } from './initializer'
import { setCurrentDyneMCPInstance } from './server-instance'
import { TRANSPORT } from '../../../../global/config-all-contants'
import { fileLogger } from '../../../../global/logger'
import { setupTransport } from './setup-transport'
import { handleGracefulShutdown } from './handle-shutdown'

/**
 * DyneMCP
 *
 * Main server class for DyneMCP. This is the primary entry point for starting, initializing,
 * and managing a DyneMCP server instance. It handles configuration, transport setup,
 * component registration, and provides access to loaded tools, resources, and prompts.
 */
export class DyneMCP {
  private server: McpServer
  private transport?: Transport
  private isInitialized = false

  /**
   * Constructs a new DyneMCP server instance with the given configuration.
   * @param config - The resolved DyneMCP configuration object
   */
  private constructor(private config: DyneMCPConfig) {
    this.server = new McpServer({
      name: config.server.name,
      version: config.server.version,
      ...((config.server as any).capabilities && {
        capabilities: (config.server as any).capabilities,
      }),
    })

    setCurrentDyneMCPInstance(this)
  }

  /**
   * Creates a new DyneMCP instance from a resolved configuration.
   * @param resolvedConfig - The resolved DyneMCP configuration object
   * @returns A new DyneMCP instance
   */
  static async create(resolvedConfig: DyneMCPConfig): Promise<DyneMCP> {
    return new DyneMCP(resolvedConfig)
  }

  /**
   * Loads configuration, initializes, and starts the DyneMCP server with the configured transport.
   * Handles graceful shutdown and logs server/transport info.
   * @returns The started DyneMCP instance
   */
  static async start(): Promise<DyneMCP> {
    const config = await loadConfig()
    const instance = await DyneMCP.create(config)
    await instance.init()

    instance.transport = setupTransport(config)
    await instance.connectTransport()
    instance.logTransportInfo()
    handleGracefulShutdown(instance)

    fileLogger.info('✅ DyneMCP server started')

    if (
      config.transport?.type === TRANSPORT.TRANSPORT_TYPES.HTTP &&
      typeof config.transport.options === 'object'
    ) {
      const { host, port } = {
        ...TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS,
        ...(config.transport.options as any),
      }
      fileLogger.info(`🌐 Server running at http://${host}:${port}`)
    }

    return instance
  }

  /**
   * Initializes the DyneMCP server by registering all components (tools, resources, prompts).
   * This method is idempotent and safe to call multiple times.
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    fileLogger.info('🚀 Initializing DyneMCP server...')

    await registerComponents(this.server, this.config)
    this.logLoadedComponents()

    this.isInitialized = true
    fileLogger.info('✅ DyneMCP server initialized correctly')
  }

  /**
   * Stops the DyneMCP server and closes the transport if available.
   * Logs shutdown information for custom transports.
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
   * Sends a sampling request to the server and returns the result.
   * @param request - The sampling request object
   * @returns The sampling result
   */
  async sample(request: SamplingRequest): Promise<SamplingResult> {
    if (typeof (this.server as any).send !== 'function') {
      throw new Error('McpServer does not support send method')
    }

    return await (this.server as any).send('sampling/createMessage', request)
  }

  /**
   * Returns the DyneMCP configuration object for this instance.
   */
  getConfig(): DyneMCPConfig {
    return this.config
  }

  /**
   * Returns server and registry statistics, including server name, version, and transport type.
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
   * Returns all loaded tool definitions for this server instance.
   */
  get tools(): ToolDefinition[] {
    return registry.getAllTools().map((t) => t.module as ToolDefinition)
  }

  /**
   * Returns all loaded resource definitions for this server instance.
   */
  get resources(): ResourceDefinition[] {
    return registry.getAllResources().map((r) => r.module as ResourceDefinition)
  }

  /**
   * Returns all loaded prompt definitions for this server instance.
   */
  get prompts(): PromptDefinition[] {
    return registry.getAllPrompts().map((p) => p.module as PromptDefinition)
  }

  /**
   * Connects the configured transport to the MCP server, handling different transport types.
   * Logs connection status and warnings for unknown transports.
   */
  private async connectTransport(): Promise<void> {
    const t = this.transport
    if (!t) return

    fileLogger.info(`🔌 Connecting transport: ${t.constructor.name}`)

    // HTTPServers needs connect() with the McpServer
    if (t.constructor.name === 'HTTPServers') {
      fileLogger.info('🌐 Initializing HTTP transport...')
      await (t as any).connect(this.server)
      fileLogger.info('✅ HTTP transport connected successfully')
    } else if ('connect' in t && typeof (t as any).connect === 'function') {
      fileLogger.info('🔗 Connecting transport with connect() method...')
      await (t as any).connect(this.server)
    } else if ('start' in t && typeof (t as any).start === 'function') {
      fileLogger.info('🚀 Connecting transport with start() method...')
      await this.server.connect(t)
    } else {
      fileLogger.warn(
        '⚠️ Unknown transport type, attempting default connection'
      )
      await this.server.connect(t)
    }
  }

  /**
   * Logs information about the transport after server startup.
   */
  private logTransportInfo(): void {
    if (this.config.transport?.type !== TRANSPORT.TRANSPORT_TYPES.STDIO) {
      fileLogger.info(
        `🎯 MCP server "${this.config.server.name}" started successfully`
      )
    }
  }

  /**
   * Logs all loaded components (tools, resources, prompts) after initialization.
   */
  private logLoadedComponents(): void {
    this.logComponentList('tools', this.tools)
    this.logComponentList('resources', this.resources)
    this.logComponentList('prompts', this.prompts)
  }

  /**
   * Logs a summary of loaded components of a given type, including invalid entries.
   * @param type - The component type (e.g., 'tools', 'resources', 'prompts')
   * @param list - The list of loaded components
   */
  private logComponentList(type: string, list: any[]): void {
    const valid = list.filter((item) => item && typeof item.name === 'string')
    const invalidCount = list.length - valid.length

    fileLogger.info(`Loaded ${type}: ${valid.length}`)
    valid.forEach((item) =>
      fileLogger.info(`  - ${type.slice(0, -1)}: ${item.name}`)
    )

    if (invalidCount > 0) {
      fileLogger.warn(
        `⚠️ ${invalidCount} invalid ${type} were skipped (missing or invalid 'name')`
      )
    }
  }

  /**
   * Returns true if the configured transport is a custom (non-STDIO) transport.
   */
  private isCustomTransport(): boolean {
    return (
      this.config.transport?.type &&
      String(this.config.transport.type) !== TRANSPORT.TRANSPORT_TYPES.STDIO
    )
  }
}
