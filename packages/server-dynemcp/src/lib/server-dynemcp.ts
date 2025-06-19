/**
 * DyneMCP Core - Wrapper for the official MCP SDK
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DyneMCPConfig } from './core/config.js';
import { ToolDefinition, ResourceDefinition, PromptDefinition } from './core/interfaces.js';
import { SERVER_VERSION } from './core/constants.js';
import { loadConfig } from './core/config.js';

// Main DyneMCP class
export class DyneMCP {
  private server: McpServer;
  private tools: ToolDefinition[] = [];
  private resources: ResourceDefinition[] = [];
  private prompts: PromptDefinition[] = [];
  private config: DyneMCPConfig;

  /**
   * Creates a new DyneMCP instance
   *
   * @param name - Server name
   * @param configPath - Path to configuration file (optional)
   * @param version - Server version (optional, defaults to SERVER_VERSION)
   */
  constructor(name: string, configPath?: string, version: string = SERVER_VERSION) {
    // Load configuration from path or use defaults
    this.config = loadConfig(configPath);

    // Override with provided parameters if they exist
    if (name) {
      this.config.server.name = name;
    }

    if (version) {
      this.config.server.version = version;
    }

    // Initialize server with config values
    this.server = new McpServer({
      name: this.config.server.name,
      version: this.config.server.version,
    });
  }

  /**
   * Registers a tool in the server
   *
   * @param tool - Tool definition
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.push(tool);

    this.server.tool(tool.name, tool.description, tool.schema, tool.handler);
  }

  /**
   * Registers multiple tools in the server
   *
   * @param tools - Array of tool definitions
   */
  registerTools(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }

  /**
   * Registers a resource in the server
   *
   * @param resource - Resource definition
   */
  registerResource(resource: ResourceDefinition): void {
    this.resources.push(resource);

    const handler = async (_args: any, _extra: any) => {
      const content =
        typeof resource.content === 'function' ? await resource.content() : resource.content;

      return {
        content: [
          {
            type: 'text' as const,
            text: content,
          },
        ],
      };
    };

    // We use an empty object for parameter schema
    this.server.tool(
      `resource:${resource.uri}`,
      resource.description || `Resource: ${resource.name}`,
      {},
      handler,
    );
  }

  /**
   * Registers multiple resources in the server
   *
   * @param resources - Array of resource definitions
   */
  registerResources(resources: ResourceDefinition[]): void {
    for (const resource of resources) {
      this.registerResource(resource);
    }
  }

  /**
   * Registers a prompt in the server
   *
   * @param prompt - Prompt definition
   */
  registerPrompt(prompt: PromptDefinition): void {
    this.prompts.push(prompt);

    // Register the prompt in the MCP server
    // Similar to resources, we implement it as a tool
    this.server.tool(
      `prompt:${prompt.id}`,
      prompt.description || `Prompt: ${prompt.name}`,
      {},
      async (_args: any, _extra: any) => {
        return {
          content: [
            {
              type: 'text' as const,
              text: prompt.content,
            },
          ],
        };
      },
    );
  }

  /**
   * Registers multiple prompts in the server
   *
   * @param prompts - Array of prompt definitions
   */
  registerPrompts(prompts: PromptDefinition[]): void {
    for (const prompt of prompts) {
      this.registerPrompt(prompt);
    }
  }

  /**
   * Starts the MCP server
   */
  async start(): Promise<void> {
    // By default, use stdio
    const transport = new StdioServerTransport();

    // Connect the server to the transport
    await this.server.connect(transport);
    console.log('MCP server started successfully');
  }

  /**
   * Stops the MCP server
   */
  async stop(): Promise<void> {
    // The current SDK doesn't have a direct method to stop the server
    console.log('Stopping MCP server...');
    // Implement closing logic if necessary
  }

  /**
   * Returns all registered tools
   */
  get registeredTools(): ToolDefinition[] {
    return [...this.tools];
  }

  /**
   * Returns all registered resources
   */
  get registeredResources(): ResourceDefinition[] {
    return [...this.resources];
  }

  /**
   * Returns all registered prompts
   */
  get registeredPrompts(): PromptDefinition[] {
    return [...this.prompts];
  }
}

/**
 * Creates a new DyneMCP instance
 *
 * @param name - Server name
 * @param configPath - Path to config file (optional)
 * @param version - Server version (optional, defaults to SERVER_VERSION)
 * @returns New DyneMCP instance
 */
export function createMCPServer(
  name: string,
  configPath?: string,
  version: string = SERVER_VERSION,
): DyneMCP {
  return new DyneMCP(name, configPath, version);
}
