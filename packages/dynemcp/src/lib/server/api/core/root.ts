// root.ts
// Helpers for working with Roots in MCP
// --------------------------------------
//
// - Provides utilities for validating, parsing, and normalizing root objects and root lists.
// - Used throughout the API for root-related operations.

import type { Root, RootList } from './interfaces'

/**
 * Checks if an object is a valid Root.
 */
export function isRoot(obj: any): obj is Root {
  return obj && typeof obj === 'object' && typeof obj.uri === 'string'
}

/**
 * Checks if an object is a valid list of Roots.
 */
export function isRootList(obj: any): obj is RootList {
  return Array.isArray(obj) && obj.every(isRoot)
}

/**
 * Parses and normalizes a list of roots from any input.
 */
export function parseRootList(input: any): RootList {
  if (isRootList(input)) return input
  if (input && typeof input === 'object' && Array.isArray(input.roots)) {
    return input.roots.filter(isRoot)
  }
  return []
}
