/**
 * DyneMCP Framework
 * Complete MCP framework with server runtime and build system
 */

// Export server functionality
export * from './server/index.js'

// Export helper functions for easier tool development
export {
  createTypedTool,
  createTextResponse,
  createErrorResponse,
  withErrorHandling,
  zodObjectToRawShape,
} from './server/core/base.js'

// Export build functionality (excluding duplicates)
export {
  build,
  watch,
  buildCli,
  clean,
  analyze,
} from './build/build-dynemcp.js'
export type {
  DyneMCPBuildOptions,
  BuildResult,
} from './build/main/core/interfaces.js'
export type { BuildConfig, DyneMCPConfig } from './build/config/index.js'
export { createDefaultConfig } from './build/config/index.js'
export * from './build/bundler/index.js'

// Export CLI functionality (selective exports to avoid auto-execution)
export { dev, ConsoleLogger, StderrLogger } from './cli/index.js'
export type { Logger } from './cli/index.js'

// Export shared utilities
export * from './shared/index.js'

// Main framework exports
export { createMCPServer } from './server/core/server/server-dynemcp.js'
