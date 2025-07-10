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
import { createTransport, type Transport } from '../../communication'
import { registerComponents } from './initializer'
import { setCurrentDyneMCPInstance } from './server-instance'
import { TRANSPORT } from '../../../../global/config-all-contants'
import { fileLogger } from '../../../../global/logger'
import { setupTransport } from './setup-transport'
import { handleGracefulShutdown } from './handle-shutdown'

export class DyneMCP {
  private server: McpServer
  private transport?: Transport
  private isInitialized = false

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

  static async create(resolvedConfig: DyneMCPConfig): Promise<DyneMCP> {
    return new DyneMCP(resolvedConfig)
  }

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

  async init(): Promise<void> {
    if (this.isInitialized) return

    fileLogger.info('🚀 Inicializando DyneMCP server...')

    await registerComponents(this.server, this.config)
    this.logLoadedComponents()

    this.isInitialized = true
    fileLogger.info('✅ DyneMCP server initialized correctly')
  }

  async stop(): Promise<void> {
    if (this.transport?.close) {
      await this.transport.close()
    }

    if (this.isCustomTransport()) {
      fileLogger.info('🛑 MCP server stopped')
    }
  }

  async sample(request: SamplingRequest): Promise<SamplingResult> {
    if (typeof (this.server as any).send !== 'function') {
      throw new Error('McpServer does not support send method')
    }

    return await (this.server as any).send('sampling/createMessage', request)
  }

  getConfig(): DyneMCPConfig {
    return this.config
  }

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

  get tools(): ToolDefinition[] {
    return registry.getAllTools().map((t) => t.module as ToolDefinition)
  }

  get resources(): ResourceDefinition[] {
    return registry.getAllResources().map((r) => r.module as ResourceDefinition)
  }

  get prompts(): PromptDefinition[] {
    return registry.getAllPrompts().map((p) => p.module as PromptDefinition)
  }

  private async connectTransport(): Promise<void> {
    const t = this.transport
    if (!t) return

    fileLogger.info(`🔌 Connecting transport: ${t.constructor.name}`)

    // HTTPServers necesita connect() con el McpServer
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

  private logTransportInfo(): void {
    if (this.config.transport?.type !== TRANSPORT.TRANSPORT_TYPES.STDIO) {
      fileLogger.info(
        `🎯 MCP server "${this.config.server.name}" started successfully`
      )
    }
  }

  private logLoadedComponents(): void {
    this.logComponentList('tools', this.tools)
    this.logComponentList('resources', this.resources)
    this.logComponentList('prompts', this.prompts)
  }

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

  private isCustomTransport(): boolean {
    return (
      this.config.transport?.type &&
      String(this.config.transport.type) !== TRANSPORT.TRANSPORT_TYPES.STDIO
    )
  }
}
