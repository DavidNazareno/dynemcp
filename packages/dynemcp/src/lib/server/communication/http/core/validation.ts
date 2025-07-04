// Helpers de validación para StreamableHTTPTransport

export function validateJSONRPCMessage(message: unknown): void {
  if (!message || typeof message !== 'object') {
    throw new Error('Message must be an object')
  }
  if ((message as any).jsonrpc !== '2.0') {
    throw new Error('Invalid JSON-RPC version, must be "2.0"')
  }
  if (!(message as any).method && (message as any).id === undefined) {
    throw new Error(
      'Message must have either method (for requests/notifications) or id (for responses)'
    )
  }
}

export function isOriginAllowed(
  origin: string,
  allowedOrigins: string | string[] | undefined
): boolean {
  if (!allowedOrigins || allowedOrigins === '*') return true
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin)
  }
  return allowedOrigins === origin
}
