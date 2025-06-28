// interfaces.ts
// Public types and interfaces for the DyneMCP Main Server module
// -------------------------------------------------------------

/**
 * Options for initializing the DyneMCP server.
 */
export interface ServerInitializationOptions {
  name: string
  version: string
  documentationUrl?: string
}
