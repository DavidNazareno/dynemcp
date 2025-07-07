// index.ts
// Public API exports for the DyneMCP Main Server module
// -----------------------------------------------------

// Types and interfaces
export type { ServerInitializationOptions } from './core/interfaces'

// Main server class and factory
export { DyneMCP, createMCPServer } from './core/server'

// Initialization and registration utilities
export {
  createMCPServerInstance,
  registerTools,
  registerResources,
  registerPrompts,
  registerComponents,
} from './core/initializer'

// Custom errors
export { ServerInitializationError } from './core/errors'

// Utilities
export { logMsg } from './core/utils'
