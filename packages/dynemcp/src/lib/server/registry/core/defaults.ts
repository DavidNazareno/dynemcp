// Default values and settings for the DyneMCP Registry module
// Provides default types and storage backend for registry configuration.

/**
 * List of default registry component types supported by DyneMCP.
 */
export const DEFAULT_REGISTRY_TYPES = [
  'tool',
  'prompt',
  'resource',
  'sample',
] as const

/**
 * Default storage backend for the registry (in-memory).
 */
export const DEFAULT_STORAGE_BACKEND = 'memory'

// TODO: Resource template defaults removed for production release. Re-implement in a future version if needed.
