// Helpers para manejo de sesión HTTP para StreamableHTTPTransport
import express from 'express'

export function handleSessionManagement(
  req: express.Request,
  res: express.Response,
  options: any,
  sessionStore: Map<string, { id: string; created: Date; lastAccess: Date }>,
  generateSecureSessionId: () => string
): string | null {
  if (!options?.session?.enabled) return null

  const sessionHeaderName = options.session.headerName ?? 'Mcp-Session-Id'
  let sessionId = req.headers[sessionHeaderName.toLowerCase()] as string

  // Handle initialization - create new session if needed
  if (req.body?.method === 'initialize' && !sessionId) {
    sessionId = generateSecureSessionId()
    res.setHeader(sessionHeaderName, sessionId)

    sessionStore.set(sessionId, {
      id: sessionId,
      created: new Date(),
      lastAccess: new Date(),
    })

    console.log(`🔐 New session created: ${sessionId}`)
  }

  // Validate existing session
  if (sessionId) {
    const session = sessionStore.get(sessionId)
    if (!session) {
      res.status(401).json({
        error: 'Invalid session ID',
        code: 'INVALID_SESSION',
      })
      return null
    }
    // Update last access time
    session.lastAccess = new Date()
    sessionStore.set(sessionId, session)
  }
  return sessionId
}

export function handleSessionTermination(
  req: express.Request,
  res: express.Response,
  options: any,
  sessionStore: Map<string, { id: string; created: Date; lastAccess: Date }>
): boolean {
  if (!options?.session?.allowClientTermination) return false

  const sessionHeaderName = options.session.headerName ?? 'Mcp-Session-Id'
  const sessionId = req.headers[sessionHeaderName.toLowerCase()] as string

  if (req.method === 'DELETE' && sessionId) {
    sessionStore.delete(sessionId)
    res.status(204).send()
    console.log(`🗑️ Session terminated: ${sessionId}`)
    return true
  }
  return false
}
