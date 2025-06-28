/**
 * DyneMCP Transport Module
 *
 * This is the public entrypoint for all transport types, schemas, and utilities.
 * It re-exports everything from the modular core transport system.
 *
 * Usage example:
 *   import { StdioTransport, StreamableHTTPTransport, TransportConfigSchema, createTransport } from '@/server/transport'
 */

// Main transport types and interfaces
export * from './core/interfaces.js'

// Zod schemas for transport config validation
export * from './core/schemas.js'

// Default config values for transports
export * from './core/defaults.js'

// Custom transport errors
export * from './core/errors.js'

// JSON-RPC helpers and type guards
export * from './core/jsonrpc.js'

// Transport implementations
export { StdioTransport } from './core/stdio.js'
export { StreamableHTTPTransport } from './core/http.js'

import type { TransportConfig } from './core/interfaces.js'
import { StdioTransport } from './core/stdio.js'
import { StreamableHTTPTransport } from './core/http.js'
import { TRANSPORT_TYPES } from './types'
import { Transport } from './interfaces'
import { StdioServerTransport } from '../stdio/server'
import { HttpServerTransport } from '../http/server'

/**
 * Factory function to create the appropriate transport based on config.
 */
export function createTransport(config: {
  type: string
  options?: any
}): Transport {
  switch (config.type) {
    case TRANSPORT_TYPES.STDIO_SERVER:
      return new StdioServerTransport(config.options)
    case TRANSPORT_TYPES.HTTP_SERVER:
      return new HttpServerTransport(config.options)
    default:
      throw new Error(`Unknown transport type: ${config.type}`)
  }
}

export { TRANSPORT_TYPES }
