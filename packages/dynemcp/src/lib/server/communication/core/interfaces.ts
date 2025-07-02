// Interfaces and types for DyneMCP transport and JSON-RPC communication
// Defines JSON-RPC message types and the Transport interface for custom transports.

// JSON-RPC 2.0 message types as per MCP specification
export interface JSONRPCRequest {
  jsonrpc: '2.0'
  id: number | string
  method: string
  params?: object
}

export interface JSONRPCResponse {
  jsonrpc: '2.0'
  id: number | string
  result?: object
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export interface JSONRPCNotification {
  jsonrpc: '2.0'
  method: string
  params?: object
}

export type JSONRPCMessage =
  | JSONRPCRequest
  | JSONRPCResponse
  | JSONRPCNotification

/**
 * Transport: Interface for MCP communication transports (stdio, HTTP, etc).
 * All custom transports must implement this interface.
 *
 * - start(): Begin processing messages (should be called once).
 * - send(): Send a JSON-RPC message to the remote peer.
 * - close(): Close the transport connection.
 * - onclose/onerror/onmessage: Optional event handlers for lifecycle and message events.
 */
export interface Transport {
  /** Start processing messages */
  start(): Promise<void>
  /** Send a JSON-RPC message */
  send(message: JSONRPCMessage): Promise<void>
  /** Close the connection */
  close(): Promise<void>
  /** Optional: Called when the connection is closed */
  onclose?: () => void
  /** Optional: Called on error */
  onerror?: (error: Error) => void
  /** Optional: Called when a message is received */
  onmessage?: (message: JSONRPCMessage) => void
}

// StdioTransportConfig: Configuration for stdio transport
export interface StdioTransportConfig {
  type: 'stdio'
  command?: string
  args?: string[]
}

// HTTPTransportConfig: Configuration for streamable HTTP transport
export interface HTTPTransportConfig {
  type: 'streamable-http'
  url: string
  sessionId?: string
  headers?: Record<string, string>
}

export type TransportConfig = StdioTransportConfig | HTTPTransportConfig
