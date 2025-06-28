// index.ts
// Public API exports for the DyneMCP Main Server module
// -----------------------------------------------------

// Types and interfaces
export type { ServerInitializationOptions } from './core/interfaces.js'

// Main server class and factory
export { DyneMCP, createMCPServer } from './core/server.js'

// Initialization and registration utilities
export {
  createMCPServerInstance,
  registerTools,
  registerResources,
  registerPrompts,
  registerComponents,
} from './core/initializer.js'

// Custom errors
export { ServerInitializationError } from './core/errors.js'

// Utilities
export { logMsg } from './core/utils.js'
