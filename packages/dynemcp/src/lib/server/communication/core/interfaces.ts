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
 * Transport interface for MCP communication.
 * All custom transports must implement this interface.
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

// Configuration for stdio transport
export interface StdioTransportConfig {
  type: 'stdio'
  command?: string
  args?: string[]
}

// Configuration for streamable HTTP transport
export interface HTTPTransportConfig {
  type: 'streamable-http'
  url: string
  sessionId?: string
  headers?: Record<string, string>
}

export type TransportConfig = StdioTransportConfig | HTTPTransportConfig
