// Type guards and validation utilities for JSON-RPC messages in DyneMCP
// Provides helpers to identify and validate JSON-RPC requests, responses, and notifications.

import type {
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCNotification,
} from '@modelcontextprotocol/sdk/types.js'

/**
 * isJSONRPCRequest: Type guard for JSON-RPC request messages.
 */
export function isJSONRPCRequest(msg: any): msg is JSONRPCRequest {
  return (
    msg &&
    msg.jsonrpc === '2.0' &&
    typeof msg.method === 'string' &&
    Object.prototype.hasOwnProperty.call(msg, 'id')
  )
}

/**
 * isJSONRPCResponse: Type guard for JSON-RPC response messages.
 */
export function isJSONRPCResponse(msg: any): msg is JSONRPCResponse {
  return (
    msg &&
    msg.jsonrpc === '2.0' &&
    Object.prototype.hasOwnProperty.call(msg, 'id') &&
    (Object.prototype.hasOwnProperty.call(msg, 'result') ||
      Object.prototype.hasOwnProperty.call(msg, 'error'))
  )
}

/**
 * isJSONRPCNotification: Type guard for JSON-RPC notification messages.
 */
export function isJSONRPCNotification(msg: any): msg is JSONRPCNotification {
  return (
    msg &&
    msg.jsonrpc === '2.0' &&
    typeof msg.method === 'string' &&
    !Object.prototype.hasOwnProperty.call(msg, 'id')
  )
}

/**
 * validateJSONRPCMessage: Validates a JSON-RPC message structure. Throws if invalid.
 */
export function validateJSONRPCMessage(msg: any): void {
  if (!msg || typeof msg !== 'object') {
    throw new Error('Message must be an object')
  }
  if (msg.jsonrpc !== '2.0') {
    throw new Error('Invalid JSON-RPC version, must be "2.0"')
  }
  if (!msg.method && msg.id === undefined) {
    throw new Error(
      'Message must have either method (for requests/notifications) or id (for responses)'
    )
  }
}
