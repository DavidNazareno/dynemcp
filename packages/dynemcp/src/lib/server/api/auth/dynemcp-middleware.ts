// Unified DyneMCP authentication middleware
// Allows JWT, OAuth2, or both (composite). User must provide config explicitly.

import type { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { auth } from 'express-oauth2-jwt-bearer'

/**
 * JWT authentication middleware for DyneMCP.
 * @param options.secret - JWT secret (required)
 * @param options.allowedRoles - Allowed roles (optional)
 * @param options.expectedAudience - Expected audience (optional)
 */
function jwtAuthMiddleware(options: {
  secret: string
  allowedRoles?: string[]
  expectedAudience?: string
}): RequestHandler {
  const { secret, allowedRoles, expectedAudience } = options
  return function (req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' })
      return
    }
    const token = authHeader.slice(7)
    try {
      const payload = jwt.verify(token, secret) as any
      if (expectedAudience && payload.aud !== expectedAudience) {
        res.status(401).json({ error: 'Invalid token audience' })
        return
      }
      if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = Array.isArray(payload.role)
          ? (payload.role as string[])
          : [payload.role as string]
        const hasRole = userRoles.some((role: string) =>
          allowedRoles.includes(role)
        )
        if (!hasRole) {
          res.status(403).json({ error: 'Insufficient role' })
          return
        }
      }
      ;(req as any).user = payload
      next()
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}

/**
 * OAuth2/OIDC JWT Bearer middleware for DyneMCP.
 * @param options { issuerBaseURL, audience }
 * @returns Express middleware
 */
function oauth2JwtMiddleware(options: {
  issuerBaseURL: string
  audience: string
}) {
  return auth({
    issuerBaseURL: options.issuerBaseURL,
    audience: options.audience,
    tokenSigningAlg: 'RS256',
  })
}

export type DynemcpMiddlewareConfig =
  | {
      type: 'jwt'
      jwt: {
        secret: string
        allowedRoles?: string[]
        expectedAudience?: string
      }
    }
  | {
      type: 'oauth2'
      oauth2: {
        issuerBaseURL: string
        audience: string
      }
    }
  | {
      type: 'both'
      jwt: {
        secret: string
        allowedRoles?: string[]
        expectedAudience?: string
      }
      oauth2: {
        issuerBaseURL: string
        audience: string
      }
    }

/**
 * Unified DyneMCP authentication middleware.
 * @param config - See DynemcpMiddlewareConfig for options.
 * @returns Express middleware
 */
export function dynemcpMiddleware(
  config: DynemcpMiddlewareConfig
): RequestHandler {
  if (config.type === 'jwt') {
    return jwtAuthMiddleware(config.jwt)
  }
  if (config.type === 'oauth2') {
    return oauth2JwtMiddleware(config.oauth2)
  }
  if (config.type === 'both') {
    const jwtMw = jwtAuthMiddleware(config.jwt)
    const oauth2Mw = oauth2JwtMiddleware(config.oauth2)
    // Composite: try OAuth2 first, fallback to JWT
    return async (req, res, next) => {
      let called = false
      await oauth2Mw(req, res, (err) => {
        if (!err && !res.headersSent) {
          called = true
          next()
        }
      })
      if (called || res.headersSent) return
      jwtMw(req, res, next)
    }
  }
  throw new Error('Invalid dynemcpMiddleware config')
}
