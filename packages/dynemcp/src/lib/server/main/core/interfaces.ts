// interfaces.ts
// Public types and interfaces for the DyneMCP Main Server module
// Defines options for initializing the main server instance.
// -------------------------------------------------------------

/**
 * ServerInitializationOptions: Options for initializing the DyneMCP server.
 */
export interface ServerInitializationOptions {
  name: string
  version: string
  documentationUrl?: string
}
