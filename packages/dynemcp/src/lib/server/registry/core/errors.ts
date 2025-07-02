// errors.ts
// Custom error classes for the DyneMCP Registry module
// Defines specific error types for registry operations (not found, load failure).
// ---------------------------------------------------

/**
 * Error thrown when a registry item is not found.
 */
export class RegistryItemNotFoundError extends Error {
  constructor(type: string, id: string) {
    super(`Registry item not found: type='${type}', id='${id}'`)
    this.name = 'RegistryItemNotFoundError'
  }
}

/**
 * Error thrown when a registry item fails to load.
 */
export class RegistryItemLoadError extends Error {
  constructor(type: string, id: string, reason?: string) {
    super(
      `Failed to load registry item: type='${type}', id='${id}'. ${reason ?? ''}`
    )
    this.name = 'RegistryItemLoadError'
  }
}
