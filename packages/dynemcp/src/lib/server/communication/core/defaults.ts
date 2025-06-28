// Default configuration for stdio transport
export const DEFAULT_STDIO_CONFIG = {
  type: 'stdio',
}

// Default configuration for streamable HTTP transport
export const DEFAULT_HTTP_CONFIG = {
  type: 'streamable-http',
  url: 'http://localhost:3000/mcp',
}

/**
 * Supported transport types for DyneMCP
 */
export const TRANSPORT_TYPES = ['stdio', 'streamable-http'] as const

export type TransportType = (typeof TRANSPORT_TYPES)[number]
