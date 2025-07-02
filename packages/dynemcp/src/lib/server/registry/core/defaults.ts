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
  'sample',
] as const

/**
 * Default registry storage backend (in-memory).
 */
export const DEFAULT_STORAGE_BACKEND = 'memory'

// TODO: Resource template defaults removed for production release. Re-implement in a future version if needed.
