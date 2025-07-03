// jwt-middleware.ts
// JWT authentication middleware for DyneMCP servers
// -------------------------------------------------
//
// - Provides a ready-to-use Express middleware for JWT authentication in DyneMCP servers.
// - Supports allowed roles and audience validation for robust security.
// - Enforces best practices: in production, expectedAudience should be set to prevent token passthrough attacks.
//
// Usage:
//   import jwtAuthMiddleware from '@dynemcp/dynemcp/auth/jwt-middleware'
//   app.use(jwtAuthMiddleware())
//   app.use(jwtAuthMiddleware(['admin', 'user']))
//   app.use(jwtAuthMiddleware({ allowedRoles: ['admin'], expectedAudience: 'my-mcp-server' }))

import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'changeme'

/**
 * JWT authentication middleware for DyneMCP servers.
 *
 * @param allowedRolesOrOptions - Array of allowed roles, or options object { allowedRoles, expectedAudience }
 * @returns Express middleware function for JWT authentication
 *
 * - In production, expectedAudience is strongly recommended for security.
 * - Sets req.user to the decoded JWT payload if valid.
 * - Responds with 401/403 on invalid or insufficient tokens.
 */
export default function jwtAuthMiddleware(
  allowedRolesOrOptions?:
    | string[]
    | {
        allowedRoles?: string[]
        expectedAudience?: string
      }
) {
  let allowedRoles: string[] | undefined
  let expectedAudience: string | undefined
  if (Array.isArray(allowedRolesOrOptions)) {
    allowedRoles = allowedRolesOrOptions
  } else if (
    allowedRolesOrOptions &&
    typeof allowedRolesOrOptions === 'object'
  ) {
    allowedRoles = allowedRolesOrOptions.allowedRoles
    expectedAudience = allowedRolesOrOptions.expectedAudience
  }
  if (process.env.NODE_ENV === 'production' && !expectedAudience) {
    console.warn(
      '[SECURITY] WARNING: No audience configured for JWT validation in production. Set expectedAudience in jwtAuthMiddleware.'
    )
  }
  return function (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid Authorization header' })
    }
    const token = authHeader.slice(7)
    try {
      const payload = jwt.verify(token, SECRET) as JwtPayload
      if (expectedAudience && payload.aud !== expectedAudience) {
        return res.status(401).json({ error: 'Invalid token audience' })
      }
      if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = Array.isArray(payload.role)
          ? (payload.role as string[])
          : [payload.role as string]
        const hasRole = userRoles.some((role: string) =>
          allowedRoles?.includes(role)
        )
        if (!hasRole) {
          return res.status(403).json({ error: 'Insufficient role' })
        }
      }
      ;(req as any).user = payload
      next()
    } catch (err) {
      console.error(err)
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}
