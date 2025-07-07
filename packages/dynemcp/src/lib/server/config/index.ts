/**
 * DyneMCP Framework Configuration Module
 *
 * This module provides all configuration types, schemas, utilities, and defaults
 * required for loading, validating, and managing configuration in the DyneMCP framework.
 *
 * Exports:
 * - TypeScript interfaces and types for strong typing across the framework
 * - Zod schemas for runtime validation of configuration files
 * - Utilities for loading and merging configuration from files and defaults
 * - Centralized default values for all configuration aspects
 * - Error handling utilities for configuration-related issues
 * - Transport configuration schemas and types
 */

// Main TypeScript types for framework-wide configuration
export type { DyneMCPConfig } from './core/interfaces'
export type { ServerConfig, AutoloadConfig } from './core/schemas'

// Utilities for loading and validating configuration
export { loadConfig, loadBaseConfig } from './core/loader'

// Centralized default values for all configuration sections
export {
  createDefaultConfig,
  DEFAULT_SERVER_NAME,
  DEFAULT_SERVER_VERSION,
  DEFAULT_CONFIG,
  DEFAULT_TOOLS_DIR,
  DEFAULT_RESOURCES_DIR,
  DEFAULT_PROMPTS_DIR,
  DEFAULT_AUTOLOAD_CONFIG,
} from './core/defaults.js'

// Error handling utilities for configuration errors
export { ConfigError } from './core/errors.js'

// Zod schemas for runtime validation and transport configuration
export * from './core/schemas.js'
// export * from './core/transport.js'
export * from '../communication/core/factory.js'

/**
 * Helper for user config files: defineConfig
 */
export function defineConfig<
  T extends import('./core/interfaces').DyneMCPConfig,
>(config: T): () => T {
  return () => config
}
