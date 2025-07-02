/**
 * DyneMCP Transport Module: Public entrypoint for all transport types, schemas, and utilities
 *
 * This is the public entrypoint for all transport types, schemas, and utilities.
 * It re-exports everything from the modular core transport system.
 *
 * Usage example:
 *   import { StdioTransport, StreamableHTTPTransport, TransportConfigSchema, createTransport } from '@/server/transport'
 *
 * - Re-exports all main contracts, schemas, defaults, errors, and helpers for transports.
 * - Provides the createTransport factory for instantiating the correct transport by config.
 */

// Main transport types and interfaces
export * from './interfaces'

// Zod schemas for transport config validation
export * from './schemas'

// Default config values for transports
export * from './defaults'

// Custom transport errors
export * from './errors'

// JSON-RPC helpers and type guards
export * from './jsonrpc'

// Transport implementations
export { StdioTransport } from '../stdio/server'
export { StreamableHTTPTransport } from '../http/server'

import { StdioTransport } from '../stdio/server'
import { StreamableHTTPTransport } from '../http/server'
import { TRANSPORT_TYPES } from './defaults'
import type { Transport } from './interfaces'

/**
 * createTransport: Factory function to create the appropriate transport based on config.
 *
 * - Accepts a config object with a 'type' and optional 'options'.
 * - Returns an instance of the corresponding Transport implementation.
 * - Throws if the type is unknown.
 */
export function createTransport(config: {
  type: string
  options?: any
}): Transport {
  switch (config.type) {
    case TRANSPORT_TYPES[0]: // 'stdio'
      return new StdioTransport() as unknown as Transport
    case TRANSPORT_TYPES[1]: // 'streamable-http'
      return new StreamableHTTPTransport(config.options) as unknown as Transport
    default:
      throw new Error(`Unknown transport type: ${config.type}`)
  }
}

export { TRANSPORT_TYPES }
