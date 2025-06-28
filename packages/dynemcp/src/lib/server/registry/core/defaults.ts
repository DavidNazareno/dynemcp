// defaults.ts
// Default values and settings for the DyneMCP Registry module
// ----------------------------------------------------------

/**
 * Default registry types supported.
 */
export const DEFAULT_REGISTRY_TYPES = [
  'tool',
  'prompt',
  'resource',
  'resource-template',
] as const

/**
 * Default registry storage backend (in-memory).
 */
export const DEFAULT_STORAGE_BACKEND = 'memory'
