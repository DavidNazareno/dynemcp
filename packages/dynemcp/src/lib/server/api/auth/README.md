# DyneMCP Unified Authentication Middleware

This middleware provides a unified authentication solution for DyneMCP servers, allowing you to choose between:

- **Local JWT** (with configurable secret, roles, and audience)
- **OAuth2/OIDC** (with issuer and audience)
- **Both at once** (composite: tries OAuth2 first, then JWT, similar to Passport.js multi-strategy)

## Installation

This middleware is included in DyneMCP. You only need to import and use it in your project.

## Usage

### 1. Local JWT only

```ts
import { dynemcpMiddleware } from '@dynemcp/dynemcp/auth/dynemcp-middleware'

export default dynemcpMiddleware({
  type: 'jwt',
  jwt: {
    secret: 'your-secret',
    allowedRoles: ['admin', 'user'], // optional
    expectedAudience: 'https://mcp.example.com/mcp', // optional
  },
})
```

### 2. OAuth2/OIDC only

```ts
import { dynemcpMiddleware } from '@dynemcp/dynemcp/auth/dynemcp-middleware'

export default dynemcpMiddleware({
  type: 'oauth2',
  oauth2: {
    issuerBaseURL: 'https://auth.example.com',
    audience: 'https://mcp.example.com/mcp',
  },
})
```

### 3. Both (composite)

```ts
import { dynemcpMiddleware } from '@dynemcp/dynemcp/auth/dynemcp-middleware'

export default dynemcpMiddleware({
  type: 'both',
  jwt: {
    secret: 'your-secret',
    allowedRoles: ['admin'],
    expectedAudience: 'https://mcp.example.com/mcp',
  },
  oauth2: {
    issuerBaseURL: 'https://auth.example.com',
    audience: 'https://mcp.example.com/mcp',
  },
})
```

## Configuration Options

- `type`: `'jwt' | 'oauth2' | 'both'`
- `jwt`:
  - `secret`: string (**required** for JWT)
  - `allowedRoles`: string[] (optional)
  - `expectedAudience`: string (optional)
- `oauth2`:
  - `issuerBaseURL`: string (**required** for OAuth2)
  - `audience`: string (**required** for OAuth2)

## Security Warnings

- **Using local JWT in public production is NOT recommended** unless you control all token issuers.
- For production and MCP/OAuth 2.1 compliance, use only `'oauth2'`.
- If you use `'both'`, the middleware will try OAuth2 first, then fallback to JWT.
- The JWT secret must be provided by the user; it is never read from the environment automatically.

## Advanced

- You can extend or wrap this middleware to add custom logic (e.g., logging, metrics, etc.).
- Inspired by Passport.js multi-strategy pattern.

---

**Always review your authentication strategy before deploying to production!**
