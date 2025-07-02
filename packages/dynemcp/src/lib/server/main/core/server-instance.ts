// Singleton instance management for DyneMCP main server
// Allows setting and getting the current DyneMCP server instance globally.

import type { DyneMCP } from './server'

let currentInstance: DyneMCP | null = null

/**
 * Sets the current DyneMCP server instance (singleton).
 */
export function setCurrentDyneMCPInstance(instance: DyneMCP) {
  currentInstance = instance
}

/**
 * Gets the current DyneMCP server instance (singleton).
 */
export function getCurrentDyneMCPInstance(): DyneMCP | null {
  return currentInstance
}
