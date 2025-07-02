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

/**
 * Clase principal para el servidor DyneMCP
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
   * Fábrica asíncrona para crear una instancia de DyneMCP.
   * Permite pasar un objeto de configuración o una ruta.
   */
  static async create(config?: DyneMCPConfig | string): Promise<DyneMCP> {
    const resolvedConfig: DyneMCPConfig =
      typeof config === 'string' || typeof config === 'undefined'
        ? await loadConfig(config)
        : config
    return new DyneMCP(resolvedConfig)
  }

  // =====================
  // Métodos públicos
  // =====================

  /**
   * Devuelve la configuración actual del servidor
   */
  getConfig(): DyneMCPConfig {
    return this.config
  }

  /**
   * Inicializa el servidor y carga todos los componentes
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
   * Arranca el servidor MCP
   */
  async start(): Promise<void> {
    await this.init()
    this.setupTransport()
    await this.connectTransport()
    this.logTransportInfo()
  }

  /**
   * Detiene el servidor MCP
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
   * Estadísticas del servidor
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
   * Herramientas registradas
   */
  get tools(): ToolDefinition[] {
    return registry.getAllTools().map((item) => item.module as ToolDefinition)
  }

  /**
   * Registered resources
   */
  get resources() {
    return registry.getAllResources()
  }

  /**
   * Prompts registrados
   */
  get prompts(): PromptDefinition[] {
    return registry
      .getAllPrompts()
      .map((item) => item.module as PromptDefinition)
  }

  async sample(request: SamplingRequest): Promise<SamplingResult> {
    if (typeof (this.server as any).send !== 'function') {
      throw new Error('McpServer does not support send method')
    }
    return await (this.server as any).send('sampling/createMessage', request)
  }

  // Métodos privados
  // =====================

  /**
   * Log de debug si DYNE_MCP_DEBUG=1
   */
  private debugLog(msg: string): void {
    if (process.env.DYNE_MCP_DEBUG) {
      console.error(`[DEBUG] ${msg}`)
    }
  }

  /**
   * Log estándar si no está silenciado
   */
  private log(msg: string): void {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.log(msg)
    }
  }

  /**
   * Muestra por log los componentes cargados
   */
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
   * Inicializa el transporte según la configuración
   */
  private setupTransport(): void {
    const transportConfig = this.config.transport || {
      type: TRANSPORT_TYPES[0],
    }
    this.transport = createTransport(transportConfig) as Transport
  }

  /**
   * Conecta el transporte al servidor MCP
   */
  private async connectTransport(): Promise<void> {
    if (
      this.transport &&
      'connect' in this.transport &&
      typeof (this.transport as any).connect === 'function'
    ) {
      // Para StdioTransport
      await (this.transport as any).connect(this.server)
    } else if (
      this.transport &&
      'start' in this.transport &&
      typeof (this.transport as any).start === 'function'
    ) {
      // Para HTTP u otros
      await this.server.connect(this.transport)
    }
  }

  /**
   * Muestra información del transporte si no es stdio
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
        console.log(`📡 Transport: ${transportConfig.type}`)
        const options = (transportConfig as any).options
        if (options?.port) {
          console.log(`🌐 Server listening on port ${options.port}`)
        }
      }
    }
  }

  /**
   * Indica si el transporte es distinto de stdio
   */
  private isCustomTransport(): boolean {
    return (
      this.config.transport?.type &&
      String(this.config.transport.type) !== 'stdio'
    )
  }
}

/**
 * Fábrica asíncrona para instancia de DyneMCP
 */
export async function createMCPServer(
  config?: DyneMCPConfig | string
): Promise<DyneMCP> {
  return DyneMCP.create(config)
}
