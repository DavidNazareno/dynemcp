import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DyneMCPConfig } from '../config.js';
import { ToolDefinition, ResourceDefinition, PromptDefinition } from '../interfaces.js';
import { loadConfig } from '../config.js';
import { registry } from '../registry/registry.js';
import { createTransport } from '../../transport/index.js';
import { 
  createMCPServerInstance, 
  registerTools, 
  registerResources, 
  registerPrompts 
} from './server-initializer.js';

export class DyneMCP {
  private server: McpServer;
  private config: DyneMCPConfig;
  private isInitialized = false;
  private transport?: any;

  constructor(name?: string, configPath?: string, version?: string) {
    this.config = loadConfig(configPath);
    
    // Override config with constructor parameters
    if (name) this.config.server.name = name;
    if (version) this.config.server.version = version;

    this.server = createMCPServerInstance({
      name: this.config.server.name,
      version: this.config.server.version,
    });
  }

  /**
   * Initialize the server and load all components
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing DyneMCP server...');

    // Load all components using unified registry
    await registry.loadAll({
      tools: this.config.tools,
      resources: this.config.resources,
      prompts: this.config.prompts,
    });

    // Register components with MCP server
    registerTools(this.server, registry.getAllTools());
    registerResources(this.server, registry.getAllResources());
    registerPrompts(this.server, registry.getAllPrompts());

    this.isInitialized = true;
    console.log('✅ DyneMCP server initialized successfully');
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    await this.init();
    
    // Create and connect transport
    const transportConfig = this.config.transport || { type: 'stdio' };
    this.transport = createTransport(transportConfig);
    await this.transport.connect(this.server);
    
    console.log(`🎯 MCP server "${this.config.server.name}" started successfully`);
    console.log(`📡 Transport: ${transportConfig.type}`);
    
    if (transportConfig.type !== 'stdio') {
      const options = (transportConfig as any).options;
      if (options?.port) {
        console.log(`🌐 Server listening on port ${options.port}`);
      }
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (this.transport?.disconnect) {
      await this.transport.disconnect();
    }
    console.log('🛑 MCP server stopped');
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
    };
  }

  /**
   * Get all registered tools
   */
  get tools(): ToolDefinition[] {
    return registry.getAllTools();
  }

  /**
   * Get all registered resources
   */
  get resources(): ResourceDefinition[] {
    return registry.getAllResources();
  }

  /**
   * Get all registered prompts
   */
  get prompts(): PromptDefinition[] {
    return registry.getAllPrompts();
  }
}

/**
 * Create a new DyneMCP server instance
 */
export function createMCPServer(name?: string, configPath?: string, version?: string): DyneMCP {
  return new DyneMCP(name, configPath, version);
} 