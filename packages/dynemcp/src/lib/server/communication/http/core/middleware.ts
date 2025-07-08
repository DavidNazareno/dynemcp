import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { createDefaultConfig } from '../../../config'
import { validateJSONRPCMessage, isOriginAllowed } from './validation'

export function setupMiddleware(
  app: express.Express,
  options: Record<string, unknown>
): void {
  // Rate limiting (security best practice)
  let rateLimitOptions = (options as any).rateLimit
  const isProduction = process.env.NODE_ENV === 'production'
  if (!rateLimitOptions) {
    const globalConfig = createDefaultConfig()
    const securityRateLimit = globalConfig.security?.rateLimit
    if (securityRateLimit && securityRateLimit.enabled !== false) {
      rateLimitOptions = {
        windowMs: securityRateLimit.windowMs ?? 15 * 60 * 1000,
        max: securityRateLimit.maxRequests ?? 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          error: 'Too many requests, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      }
    }
  }
  if (!rateLimitOptions) {
    rateLimitOptions = {
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    }
  }
  if (
    isProduction &&
    (rateLimitOptions.max === 0 || rateLimitOptions.enabled === false)
  ) {
    throw new Error(
      '[SECURITY] Rate limiting must be enabled in production. Set security.rateLimit.enabled = true or configure rateLimit in transport options.'
    )
  } else if (
    !isProduction &&
    (rateLimitOptions.max === 0 || rateLimitOptions.enabled === false)
  ) {
    console.warn(
      '[SECURITY] WARNING: Rate limiting is disabled. This is unsafe for production.'
    )
  }
  app.use(rateLimit(rateLimitOptions))

  // Security: Validate Origin headers to prevent DNS rebinding attacks
  const originMiddleware: express.RequestHandler = (req, res, next) => {
    const origin = req.headers.origin
    if (
      origin &&
      !isOriginAllowed(origin, (options as any).cors?.allowOrigin)
    ) {
      res.status(403).json({
        error: 'Forbidden: Origin not allowed',
        code: 'ORIGIN_NOT_ALLOWED',
      })
      return
    }
    next()
  }
  app.use(originMiddleware)

  // JSON parsing with size limits
  app.use(
    express.json({
      limit: (options as any).maxMessageSize ?? '4mb',
      verify: (req, res, buf) => {
        // Validate JSON-RPC structure
        if (buf.length > 0) {
          try {
            const body = JSON.parse(buf.toString())
            validateJSONRPCMessage(body)
          } catch (error) {
            throw new Error(`Invalid JSON-RPC message: ${error}`)
          }
        }
      },
    })
  )

  // CORS configuration
  if (options.cors) {
    app.use(
      cors({
        origin: (options as any).cors?.allowOrigin ?? '*',
        methods: (options as any).cors?.allowMethods ?? 'GET, POST, OPTIONS',
        allowedHeaders:
          (options as any).cors?.allowHeaders ??
          'Content-Type, Authorization, Mcp-Session-Id, Last-Event-ID',
        exposedHeaders:
          (options as any).cors?.exposeHeaders ??
          'Content-Type, Mcp-Session-Id',
        maxAge: (options as any).cors?.maxAge ?? 86400,
        credentials: true,
      })
    )
  }
}
