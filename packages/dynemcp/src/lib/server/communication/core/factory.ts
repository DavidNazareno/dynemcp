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

// Custom transport errors
export * from './errors'

// JSON-RPC helpers and type guards
export * from './jsonrpc'

// Transport implementations
export { StdioTransport } from '../stdio/server'
export { HTTPServers } from '../http/server'

import { StdioTransport } from '../stdio/server'
import { HTTPServers } from '../http/server'
import { TRANSPORT } from '../../../../global/config-all-contants'
import type {
  StdioTransportOptions,
  StreamableHTTPTransportOptions,
} from '../../config/core/transport'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'

/**
 * createTransport: Factory function to create the appropriate transport based on config.
 *
 * - Accepts a config object with a 'type' and optional 'options'.
 * - Returns an instance of the corresponding Transport implementation.
 * - Throws if the type is unknown.
 */
export function createTransport(config: {
  type: string
  options?: StreamableHTTPTransportOptions | StdioTransportOptions
}): Transport {
  switch (config.type) {
    case TRANSPORT.TRANSPORT_TYPES.STDIO: // 'stdio'
      return new StdioTransport()
    case TRANSPORT.TRANSPORT_TYPES.HTTP: // 'http'
      return new HTTPServers(config.options)
    default:
      return new StdioTransport()
  }
}
