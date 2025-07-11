// index.ts
// Public API exports for the DyneMCP Main Server module
// -----------------------------------------------------

// Types and interfaces
export type { ServerInitializationOptions } from './core/interfaces'

// Main server class and factory
export { DyneMCP } from './core/server'

// Inspector
export { launchInspectorProcess } from './core/inspector'

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
