// errors.ts
// Custom error classes for the DyneMCP Main Server module
// Defines error types for server initialization failures.
// ------------------------------------------------------

/**
 * ServerInitializationError: Thrown when server initialization fails.
 */
export class ServerInitializationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerInitializationError'
  }
}
