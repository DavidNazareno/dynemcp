/**
 * DyneMCP Transport Module
 *
 * This is the public entrypoint for all transport types, schemas, and utilities.
 * It re-exports everything from the modular core transport system.
 *
 * Usage example:
 *   import { StdioTransport, StreamableHTTPTransport, TransportConfigSchema } from '@/server/transport'
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
