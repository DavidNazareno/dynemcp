import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { TransportError } from './errors.js'

/**
 * StdioTransport provides communication over standard input/output streams.
 * Ideal for CLI tools and local integrations.
 */
export class StdioTransport {
  private transport?: StdioServerTransport

  /**
   * Connects the MCP server using stdio transport.
   * @param server The MCP server instance.
   */
  async connect(server: McpServer): Promise<void> {
    this.transport = new StdioServerTransport()
    try {
      await server.connect(this.transport)
      // No logs in stdio mode to avoid contaminating output
    } catch (error) {
      throw TransportError.connectionError(
        `Failed to connect stdio transport: ${error}`
      )
    }
  }

  /**
   * Disconnects the stdio transport (no-op for stdio).
   */
  async disconnect(): Promise<void> {
    // Stdio transport doesn't need explicit cleanup
  }
}
