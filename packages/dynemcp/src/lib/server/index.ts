/**
 * Server system exports for DyneMCP
 * Exposes all main server modules: main, api, registry, config, communication, components
 */

// Main server entry points
export * from './main/index.js'

// Registry system
export * from './registry/index.js'

// Config system (avoid ambiguous re-exports)
export type {
  DyneMCPConfig,
  ServerConfig,
  TransportConfig,
  AutoloadConfig,
} from './config/index.js'

// Communication/transport system
export * from './communication/index.js'

// Component loading/creation helpers
export * from './components/index.js'

// API público completo
export * from './api/index.js'
