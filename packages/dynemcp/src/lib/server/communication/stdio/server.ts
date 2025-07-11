import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport as SDKStdioTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { TransportError } from '../core/errors'
import { isJSONRPCNotification } from '../core/jsonrpc'
import { parseRootList } from '../../api/core/root'
import type {
  JSONRPCMessage,
  MessageExtraInfo,
} from '@modelcontextprotocol/sdk/types.js'
import type { TransportSendOptions } from '@modelcontextprotocol/sdk/shared/transport.js'
import { fileLogger } from '../../../../global/logger'
/**
 * StdioTransport: STDIO transport for DyneMCP MCP protocol
 * Compatible with the Transport interface of the SDK
 */
export class StdioTransport {
  readonly type = 'stdio'
  private transport: SDKStdioTransport
  private roots: any = []
  private running = false

  // Transport events
  private _onclose?: () => void
  private _onerror?: (error: Error) => void
  private _onmessage?: (
    message: JSONRPCMessage,
    extra?: MessageExtraInfo
  ) => void
  private _setProtocolVersion?: (version: string) => void
  sessionId?: string

  constructor() {
    this.transport = new SDKStdioTransport()
  }

  /**
   * Initializes the transport (Transport.start)
   */
  async start(): Promise<void> {
    await this.transport.start()
    this.running = true
  }

  /**
   * Connects the MCP server using stdio transport (legacy, for compatibility)
   */
  async connect(server: McpServer): Promise<void> {
    try {
      // Intercepts messages for roots/didChange
      const origOnMessage = this.transport.onmessage?.bind(this.transport)
      this.transport.onmessage = (msg: JSONRPCMessage) => {
        if (isJSONRPCNotification(msg) && msg.method === 'roots/didChange') {
          const roots = parseRootList(msg.params)
          this.roots = roots
          // Optionally, emit an event or log
          fileLogger.info(`🌱 Roots updated (stdio): ${roots}`)
          return // Do not forward this notification to the MCP server
        }
        if (origOnMessage) origOnMessage(msg)
      }
      await server.connect(this.transport)
      this.running = true
    } catch (error) {
      throw TransportError.connectionError(
        `Failed to connect stdio transport: ${error}`
      )
    }
  }

  /**
   * Sends a JSON-RPC message (Transport.send)
   */
  async send(
    message: JSONRPCMessage,
    options?: TransportSendOptions
  ): Promise<void> {
    // If the SDK accepts options, pass them; if not, just the message
    if (this.transport.send.length === 2) {
      await (this.transport as any).send(message, options)
    } else {
      await this.transport.send(message)
    }
  }

  /**
   * Closes the transport (Transport.close)
   */
  async close(): Promise<void> {
    await this.transport.close()
    this.running = false
  }

  /**
   * Returns the current roots (single-session)
   */
  getRoots() {
    return this.roots || []
  }

  /**
   * Transport events and properties
   */
  set onclose(handler: (() => void) | undefined) {
    this._onclose = handler
    this.transport.onclose = handler
  }
  get onclose() {
    return this._onclose
  }

  set onerror(handler: ((error: Error) => void) | undefined) {
    this._onerror = handler
    this.transport.onerror = handler
  }
  get onerror() {
    return this._onerror
  }

  set onmessage(
    handler:
      | ((message: JSONRPCMessage, extra?: MessageExtraInfo) => void)
      | undefined
  ) {
    this._onmessage = handler
    this.transport.onmessage = handler
  }
  get onmessage() {
    return this._onmessage
  }

  set setProtocolVersion(fn: ((version: string) => void) | undefined) {
    this._setProtocolVersion = fn
    // Only assign if it exists in the SDK
    if (
      'setProtocolVersion' in this.transport &&
      typeof (this.transport as any).setProtocolVersion === 'function'
    ) {
      ;(this.transport as any).setProtocolVersion = fn
    }
  }
  get setProtocolVersion() {
    return this._setProtocolVersion
  }

  /**
   * Indicates if the transport is running
   */
  isRunning(): boolean {
    return this.running
  }
}
