// utils.ts
// Shared utilities for the DyneMCP bundler
// ----------------------------------------
//
// - Provides logging utility for controlling build/bundle output.
// - Used throughout the bundler for conditional logging based on environment.

/**
 * Determine if logs should be printed based on environment variables.
 */
export function shouldLog() {
  return process.env.BUILD_LOGS === '1' || process.env.NODE_ENV !== 'production'
}
