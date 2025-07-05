// If you use TypeScript, install types: pnpm add -D @types/jsonwebtoken
import {
  dynemcpMiddleware,
  type DynemcpMiddlewareConfig,
} from '@dynemcp/dynemcp/server/api/auth/dynemcp-middleware'

/**
 * DyneMCP authentication middleware.
 *
 * Usage:
 *   // Simple JWT authentication:
 *   export default dynemcpMiddleware({
 *     type: 'jwt',
 *     jwt: {
 *       secret: process.env.JWT_SECRET!,
 *       allowedRoles: ['admin', 'user'], // optional
 *       expectedAudience: 'your-api'     // optional but recommended
 *     }
 *   })
 *
 *   // OAuth2/OIDC authentication:
 *   export default dynemcpMiddleware({
 *     type: 'oauth2',
 *     oauth2: {
 *       issuerBaseURL: process.env.AUTH0_ISSUER_URL!,
 *       audience: process.env.AUTH0_AUDIENCE!
 *     }
 *   })
 *
 *   // Both JWT and OAuth2 (OAuth2 first, JWT as fallback):
 *   export default dynemcpMiddleware({
 *     type: 'both',
 *     jwt: {
 *       secret: process.env.JWT_SECRET!,
 *       allowedRoles: ['admin']
 *     },
 *     oauth2: {
 *       issuerBaseURL: process.env.AUTH0_ISSUER_URL!,
 *       audience: process.env.AUTH0_AUDIENCE!
 *     }
 *   })
 */

// Default configuration using JWT authentication
const config: DynemcpMiddlewareConfig = {
  type: 'jwt',
  jwt: {
    secret: process.env.JWT_SECRET!,
    expectedAudience: process.env.JWT_AUDIENCE, // recommended for security
  },
}

export default dynemcpMiddleware(config)
