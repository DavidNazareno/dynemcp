import express from 'express'
import { registry } from '../../../registry/core/registry'

export async function loadAuthenticationMiddleware(): Promise<express.RequestHandler> {
  // Use registry to find src/middleware.ts automatically
  const middlewarePath = registry.getAuthenticationMiddlewarePath()
  if (!middlewarePath) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Authentication middleware (src/middleware.ts) is required in production. Please create src/middleware.ts and export a default Express middleware.'
      )
    }
    // In development, allow all requests but log a warning
    console.warn(
      '⚠️ No authentication middleware (src/middleware.ts) found. All requests are allowed (development only).'
    )
    return (req, res, next) => next()
  }
  try {
    const middlewareModule = await import(middlewarePath)
    if (typeof middlewareModule.default !== 'function') {
      throw new Error(
        'Authentication middleware must export a default function'
      )
    }
    console.log(`🔒 Authentication middleware loaded from ${middlewarePath}`)
    return middlewareModule.default
  } catch (error) {
    console.error('Failed to load authentication middleware:', error)
    throw error
  }
}
