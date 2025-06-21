import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ConsoleLogger, type Logger } from '../../../cli/index.js'
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
  private logger: Logger

  public readonly registry = registry

  constructor(
    name?: string,
    configPath?: string,
    version?: string,
    logger?: Logger
  ) {
    this.config = loadConfig(configPath)
    this.logger = logger ?? new ConsoleLogger()

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
   * Initialize the server and load all components
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    this.logger.info('🚀 Initializing DyneMCP server...')

    // Load all components using unified registry
    await registry.loadAll(
      {
        tools: this.config.tools,
        resources: this.config.resources,
        prompts: this.config.prompts,
      },
      this.logger
    )

    // Register components with MCP server
    registerTools(this.server, registry.getAllTools())
    registerResources(this.server, registry.getAllResources())
    registerPrompts(this.server, registry.getAllPrompts())

    this.isInitialized = true
    this.logger.success('✅ DyneMCP server initialized successfully')
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    await this.init()

    // Create and connect transport
    const transportConfig = this.config.transport || { type: 'stdio' }
    this.transport = createTransport(transportConfig, this.logger)
    await this.transport.connect(this.server)

    this.logger.success(
      `🎯 MCP server "${this.config.server.name}" started successfully`
    )
    this.logger.info(`📡 Transport: ${transportConfig.type}`)

    if (transportConfig.type !== 'stdio') {
      const options = (transportConfig as any).options
      if (options?.port) {
        this.logger.info(`🌐 Server listening on port ${options.port}`)
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
    this.logger.info('🛑 MCP server stopped')
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
  version?: string,
  logger?: Logger
): DyneMCP {
  return new DyneMCP(name, configPath, version, logger)
}
