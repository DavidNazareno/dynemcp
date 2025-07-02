// Default configuration values and supported types for DyneMCP transports
// Provides defaults for stdio and HTTP transports, and the list of supported types.

// DEFAULT_STDIO_CONFIG: Default configuration for stdio transport
export const DEFAULT_STDIO_CONFIG = {
  type: 'stdio',
}

// DEFAULT_HTTP_CONFIG: Default configuration for streamable HTTP transport
export const DEFAULT_HTTP_CONFIG = {
  type: 'streamable-http',
  url: 'http://localhost:3000/mcp',
}

/**
 * TRANSPORT_TYPES: Supported transport types for DyneMCP
 */
export const TRANSPORT_TYPES = ['stdio', 'streamable-http'] as const

export type TransportType = (typeof TRANSPORT_TYPES)[number]
