// If you use TypeScript, install types: pnpm add -D @types/jsonwebtoken
import jwtAuthMiddleware from '@dynemcp/dynemcp/auth/jwt-middleware'

/**
 * JWT authentication middleware for DyneMCP servers.
 *
 * Usage:
 *   // Allow any user with a valid JWT (default):
 *   export default jwtAuthMiddleware()
 *
 *   // Restrict to users with specific roles:
 *   export default jwtAuthMiddleware(['admin', 'user'])
 *
 * Behavior:
 *   - If you pass an array of roles, only users whose JWT contains at least one of those roles are allowed (403 if not).
 *   - If you do not pass roles, any user with a valid JWT is allowed.
 *   - If the JWT is missing, invalid, or expired, the request is rejected with 401.
 */

// By default, allows any user with a valid JWT:
export default jwtAuthMiddleware()
