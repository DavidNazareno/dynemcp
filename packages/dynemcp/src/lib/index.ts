/**
 * DyneMCP Framework
 * Complete MCP framework with server runtime and build system
 */

// Export server functionality (incluye DyneMCPConfig)
export * from './server'

// Export build functionality (main entrypoints, types, bundler)
/* export * from './build-old/main'
export * from './build-old/bundler' */

// Export CLI functionality (only public API)
export { ConsoleLogger, StderrLogger, cli, dev } from './cli'
export type { Logger } from './cli'

// Main framework exports (legacy/compat)
export { createMCPServer } from './server'
export { tool } from './server/api'
export { resource, prompt } from './server/api'
// export { sample } from './server/api' // sample no existe
export * from './server/api/auth'
