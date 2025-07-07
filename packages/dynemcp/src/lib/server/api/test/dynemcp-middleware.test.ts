import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock external dependencies before importing the middleware
vi.mock('jsonwebtoken', () => {
  const verify = vi.fn()
  return { default: { verify }, verify }
})
vi.mock('express-oauth2-jwt-bearer', () => {
  return { auth: vi.fn() }
})

import jwt from 'jsonwebtoken'
import { auth as oauthAuth } from 'express-oauth2-jwt-bearer'
const jwtVerifyMock = jwt.verify as unknown as ReturnType<typeof vi.fn>
const oauth2AuthMock = oauthAuth as unknown as ReturnType<typeof vi.fn>

import { dynemcpMiddleware } from '../auth/dynemcp-middleware'
import type { RequestHandler } from 'express'

// ---------------------------------------------------------------------------
// Helpers to create mock Express req/res/next objects
// ---------------------------------------------------------------------------
function createReq(authHeader?: string): any {
  return { headers: authHeader ? { authorization: authHeader } : {} }
}

function createRes() {
  return {
    statusCode: undefined as number | undefined,
    body: undefined as any,
    headersSent: false,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(obj: any) {
      this.body = obj
      this.headersSent = true
      return this
    },
  }
}

// Dummy next function
const next = vi.fn()

// Utility to run middleware and await async resolution
async function runMw(mw: RequestHandler, req: any, res: any) {
  await mw(req, res, next)
}

describe('dynemcpMiddleware - JWT only', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('responds 401 when Authorization header missing', async () => {
    const mw = dynemcpMiddleware({
      type: 'jwt',
      jwt: { secret: 's' },
    })
    const req = createReq()
    const res = createRes()

    await runMw(mw, req, res)

    expect(res.statusCode).toBe(401)
    expect(res.body).toHaveProperty('error')
    expect(jwtVerifyMock).not.toHaveBeenCalled()
  })

  it('calls next when token valid and role allowed', async () => {
    jwtVerifyMock.mockReturnValue({ role: 'admin', aud: 'aud1' })

    const mw = dynemcpMiddleware({
      type: 'jwt',
      jwt: { secret: 's', allowedRoles: ['admin'], expectedAudience: 'aud1' },
    })
    const req = createReq('Bearer token123')
    const res = createRes()

    await runMw(mw, req, res)

    expect(next).toHaveBeenCalled()
    expect(res.statusCode).toBeUndefined()
  })

  it('responds 403 when role not allowed', async () => {
    jwtVerifyMock.mockReturnValue({ role: 'user', aud: 'aud1' })

    const mw = dynemcpMiddleware({
      type: 'jwt',
      jwt: { secret: 's', allowedRoles: ['admin'] },
    })

    const req = createReq('Bearer token')
    const res = createRes()
    await runMw(mw, req, res)

    expect(res.statusCode).toBe(403)
  })

  it('responds 401 when audience mismatch', async () => {
    jwtVerifyMock.mockReturnValue({ role: 'admin', aud: 'wrong' })

    const mw = dynemcpMiddleware({
      type: 'jwt',
      jwt: { secret: 's', expectedAudience: 'expected' },
    })
    const res = createRes()
    await runMw(mw, createReq('Bearer t'), res)

    expect(res.statusCode).toBe(401)
  })
})

describe('dynemcpMiddleware - OAuth2 only', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns oauth2 middleware from express-oauth2-jwt-bearer', () => {
    const fakeMw: RequestHandler = vi.fn()
    oauth2AuthMock.mockReturnValue(fakeMw)

    const mw = dynemcpMiddleware({
      type: 'oauth2',
      oauth2: { issuerBaseURL: 'https://i', audience: 'aud' },
    })

    expect(mw).toBe(fakeMw)
    expect(oauth2AuthMock).toHaveBeenCalled()
  })
})

describe('dynemcpMiddleware - both (composite)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('uses oauth2 middleware and skips jwt when oauth2 passes', async () => {
    const oauthMw: RequestHandler = async (_req, _res, nextFn) => {
      nextFn() // no error
    }
    oauth2AuthMock.mockReturnValue(oauthMw)
    const mw = dynemcpMiddleware({
      type: 'both',
      jwt: { secret: 's' },
      oauth2: { issuerBaseURL: 'x', audience: 'y' },
    })

    const req = createReq('Bearer jwtToken')
    const res = createRes()

    await runMw(mw, req, res)

    expect(jwtVerifyMock).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('falls back to jwt when oauth2 fails', async () => {
    const oauthMw: RequestHandler = async (_req, _res, nextFn) => {
      nextFn(new Error('oauth2 fail'))
    }
    oauth2AuthMock.mockReturnValue(oauthMw)
    jwtVerifyMock.mockReturnValue({})

    const mw = dynemcpMiddleware({
      type: 'both',
      jwt: { secret: 's' },
      oauth2: { issuerBaseURL: 'x', audience: 'y' },
    })

    const req = createReq('Bearer jwtToken')
    const res = createRes()

    await runMw(mw, req, res)

    expect(jwtVerifyMock).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
