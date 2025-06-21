/**
 * DyneMCP Framework
 * Complete MCP framework with server runtime and build system
 */

// Export server functionality
export * from './server/index.js'

// Export build functionality (excluding duplicates)
export {
  build,
  watch,
  buildCli,
  clean,
  analyze,
} from './build/build-dynemcp.js'
export type { DyneMCPBuildOptions, BuildResult } from './build/build-dynemcp.js'
export type { BuildConfig, DyneMCPConfig } from './build/config/index.js'
export { createDefaultConfig } from './build/config/index.js'
export * from './build/bundler/index.js'

// Export CLI functionality
export * from './cli/index.js'

// Export shared utilities
export * from './shared/index.js'

// Main framework exports
export { createMCPServer } from './server/core/server/server-dynemcp.js'
export { dev } from './cli/index.js'
