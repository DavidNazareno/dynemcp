import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { TransportError } from '../core/errors'
import { isJSONRPCNotification } from '../core/jsonrpc'
import { parseRootList } from '../../api/core/root'

/**
 * StdioTransport: STDIO transport for DyneMCP MCP protocol
 *
 * - Provides communication over standard input/output streams.
 * - Ideal for CLI tools and local integrations.
 * - Handles roots/didChange notifications and integrates with the MCP server.
 */
export class StdioTransport {
  private transport?: StdioServerTransport
  private roots: any = []

  /**
   * Connects the MCP server using stdio transport.
   * @param server The MCP server instance.
   */
  async connect(server: McpServer): Promise<void> {
    this.transport = new StdioServerTransport()
    try {
      // Intercept incoming messages to handle roots/didChange
      const origOnMessage = this.transport.onmessage?.bind(this.transport)
      this.transport.onmessage = (msg: any) => {
        if (isJSONRPCNotification(msg) && msg.method === 'roots/didChange') {
          const roots = parseRootList(msg.params)
          this.roots = roots
          // Optionally, emit an event or log
          console.log('🌱 Roots updated (stdio):', roots)
          return // Do not forward this notification to the MCP server
        }
        if (origOnMessage) origOnMessage(msg)
      }
      await server.connect(this.transport)
      // No logs in stdio mode to avoid contaminating output
    } catch (error) {
      throw TransportError.connectionError(
        `Failed to connect stdio transport: ${error}`
      )
    }
  }

  /**
   * Get the current roots (single-session)
   */
  getRoots() {
    return this.roots || []
  }

  /**
   * Disconnects the stdio transport (no-op for stdio).
   */
  async disconnect(): Promise<void> {
    // Stdio transport doesn't need explicit cleanup
  }
}
