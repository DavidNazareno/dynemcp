// errors.ts
// Custom error classes for the DyneMCP Main Server module
// ------------------------------------------------------

/**
 * Error thrown when server initialization fails.
 */
export class ServerInitializationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerInitializationError'
  }
}
