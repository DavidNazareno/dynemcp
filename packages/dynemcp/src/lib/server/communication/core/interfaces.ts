// Interfaces and types for DyneMCP transport and JSON-RPC communication
// Defines JSON-RPC message types and the Transport interface for custom transports.

import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js'
import type { z } from 'zod'
import {
  StdioTransportConfigSchema,
  HTTPTransportConfigSchema,
  TransportConfigSchema,
} from './schemas'

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

export type StdioTransportConfig = z.infer<typeof StdioTransportConfigSchema>
export type HTTPTransportConfig = z.infer<typeof HTTPTransportConfigSchema>
export type TransportConfig = z.infer<typeof TransportConfigSchema>
