// If you use TypeScript, install types: pnpm add -D @types/jsonwebtoken
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'changeme'

/**
 * JWT authentication middleware for DyneMCP servers.
 *
 * Usage:
 *   import jwtAuthMiddleware from '@dynemcp/dynemcp/auth/jwt-middleware'
 *   app.use(jwtAuthMiddleware())
 *
 * Optionally, pass an array of allowed roles:
 *   app.use(jwtAuthMiddleware(['admin', 'user']))
 */
export default function jwtAuthMiddleware(allowedRoles?: string[]) {
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
      if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = Array.isArray(payload.role)
          ? (payload.role as string[])
          : [payload.role as string]
        const hasRole = userRoles.some((role: string) =>
          allowedRoles.includes(role)
        )
        if (!hasRole) {
          return res.status(403).json({ error: 'Insufficient role' })
        }
      }
      ;(req as any).user = payload
      next()
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}
