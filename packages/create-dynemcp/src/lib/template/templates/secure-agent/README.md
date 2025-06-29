# Secure Agent DyneMCP Template

An enterprise-grade MCP (Model Context Protocol) server template using **Streamable HTTP transport** with advanced security features - perfect for production environments requiring authentication, authorization, and comprehensive security measures.

## 🚀 What's Included

This template provides a security-focused MCP server with:

- **Advanced Authentication**: Multi-scope API key authentication
- **Authorization Framework**: Role-based access control (RBAC)
- **Session Security**: Secure session management with encryption
- **Advanced Resumability**: Encrypted event history with replay protection
- **DNS Rebinding Protection**: Hostname validation and security headers
- **Rate Limiting**: Advanced rate limiting with per-endpoint controls
- **Audit Logging**: Comprehensive security event logging
- **HTTPS Support**: TLS/SSL configuration ready
- **Security Headers**: Complete security header implementation

## 🔒 Security Features Overview

### Authentication & Authorization

- **API Key Authentication**: Secure token-based authentication
- **Scope-based Authorization**: Granular permission control (read, write, admin)
- **Session Encryption**: AES-256-GCM encrypted session data
- **Token Validation**: Comprehensive token verification and scoping

### Transport Security

- **DNS Rebinding Protection**: Prevents malicious domain attacks
- **Hostname Validation**: Strict hostname checking
- **HTTPS Ready**: TLS/SSL configuration support
- **Secure Headers**: HSTS, CSP, and other security headers

### Session Management

- **Encrypted Sessions**: All session data encrypted at rest
- **Secure Resumability**: Tamper-proof event history
- **Session Expiration**: Configurable session timeouts
- **Force Termination**: Administrative session control

## 📁 Project Structure

```
secure-agent/
├── src/
│   ├── index.ts              # Main secure server entry point
│   ├── auth.ts               # Authentication middleware
│   ├── tools/                # Secure tools
│   │   └── status.ts         # System status tool
│   ├── resources/            # Security resources
│   │   └── security-policies.ts # Security policy info
│   └── prompts/              # Security-aware prompts
│       └── security-context.ts  # Security guidance
├── dynemcp.config.json       # Full security configuration
├── package.json              # Dependencies with security libs
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## 🔧 Quick Start

1. **Navigate to your project directory**:

   ```bash
   cd secure-agent
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment**:

   ```bash
   # Create .env file
   echo "API_KEY_SECRET=your-super-secret-key-here" > .env
   echo "ENCRYPTION_KEY=your-32-character-encryption-key" >> .env
   echo "JWT_SECRET=your-jwt-secret-key" >> .env
   ```

4. **Build the project**:

   ```bash
   npm run build
   ```

5. **Start the secure server**:

   ```bash
   npm start
   ```

6. **Test with authentication**:

   ```bash
   # Test health endpoint (no auth required)
   curl http://localhost:4000/health

   # Test MCP endpoint with API key
   curl -X POST http://localhost:4000/mcp \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-api-key" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "initialize",
       "params": {
         "protocolVersion": "2024-11-05",
         "capabilities": {},
         "clientInfo": {"name": "secure-client", "version": "1.0.0"}
       }
     }'
   ```

## 🛠️ Security Configuration

The `dynemcp.config.json` includes comprehensive security settings:

```json
{
  "transport": {
    "type": "streamable-http",
    "options": {
      "port": 4000,
      "host": "localhost",
      "endpoint": "/mcp",
      "responseMode": "stream",
      "session": {
        "enabled": true,
        "headerName": "Mcp-Session-Id",
        "allowClientTermination": true,
        "maxDuration": 7200000,
        "cleanup": {
          "enabled": true,
          "interval": 180000
        }
      },
      "resumability": {
        "enabled": true,
        "historyDuration": 300000,
        "headerName": "Last-Event-ID",
        "maxEvents": 1000
      },
      "cors": {
        "allowOrigin": ["https://localhost:3000", "https://trusted-client.com"],
        "allowMethods": "GET, POST, OPTIONS, DELETE",
        "allowHeaders": "Content-Type, Authorization, Mcp-Session-Id, Last-Event-ID, X-API-Key",
        "exposeHeaders": "Content-Type, Mcp-Session-Id, X-RateLimit-Remaining",
        "maxAge": 86400,
        "credentials": true
      },
      "authentication": {
        "path": "./src/auth.ts",
        "required": true,
        "scopes": ["read", "write", "admin"]
      },
      "healthCheck": {
        "enabled": true,
        "endpoint": "/health",
        "auth": false
      },
      "maxMessageSize": "2mb",
      "compression": {
        "enabled": true,
        "threshold": 512,
        "level": 6
      },
      "security": {
        "dnsRebindingProtection": true,
        "hostnameValidation": true,
        "rateLimiting": {
          "enabled": true,
          "windowMs": 60000,
          "maxRequests": 100,
          "skipOnSuccess": false
        }
      }
    }
  },
  "security": {
    "enableValidation": true,
    "strictMode": true,
    "allowedOrigins": ["https://localhost:3000", "https://trusted-client.com"],
    "rateLimit": {
      "enabled": true,
      "maxRequests": 100,
      "windowMs": 900000
    },
    "encryption": {
      "enabled": true,
      "algorithm": "aes-256-gcm"
    }
  }
}
```

## 🔐 Authentication Implementation

### API Key Authentication (`src/auth.ts`)

```typescript
import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

interface AuthenticatedRequest extends Request {
  auth?: {
    scope: string[]
    clientId: string
    authenticated: boolean
  }
}

export interface AuthMiddleware {
  (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>
}

// API Key validation
const validateApiKey = async (
  apiKey: string
): Promise<{
  valid: boolean
  scopes: string[]
  clientId: string
}> => {
  // In production, validate against secure database
  const validKeys = {
    sk_read_abc123: { scopes: ['read'], clientId: 'client1' },
    sk_write_def456: { scopes: ['read', 'write'], clientId: 'client2' },
    sk_admin_ghi789: {
      scopes: ['read', 'write', 'admin'],
      clientId: 'client3',
    },
  }

  const keyInfo = validKeys[apiKey as keyof typeof validKeys]
  return {
    valid: !!keyInfo,
    scopes: keyInfo?.scopes || [],
    clientId: keyInfo?.clientId || '',
  }
}

// Authentication middleware
export const authMiddleware: AuthMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] as string

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'MISSING_API_KEY',
    })
  }

  const validation = await validateApiKey(apiKey)

  if (!validation.valid) {
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
    })
  }

  req.auth = {
    scope: validation.scopes,
    clientId: validation.clientId,
    authenticated: true,
  }

  next()
}

// Scope authorization
export const requireScope = (requiredScope: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth?.scope.includes(requiredScope)) {
      return res.status(403).json({
        error: `Insufficient permissions. Required scope: ${requiredScope}`,
        code: 'INSUFFICIENT_SCOPE',
      })
    }
    next()
  }
}
```

## 🔒 Security Features Deep Dive

### 1. Session Encryption

```typescript
// Session data is encrypted using AES-256-GCM
const encryptSessionData = (data: any, key: string): string => {
  const cipher = crypto.createCipher('aes-256-gcm', key)
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}
```

### 2. DNS Rebinding Protection

```typescript
// Validates hostname against allowed hosts
const validateHostname = (req: Request): boolean => {
  const hostname = req.get('host')
  const allowedHosts = ['localhost:4000', 'secure-api.company.com']
  return allowedHosts.includes(hostname || '')
}
```

### 3. Rate Limiting

```typescript
// Advanced rate limiting with different limits per scope
const rateLimitConfig = {
  read: { windowMs: 60000, max: 100 },
  write: { windowMs: 60000, max: 50 },
  admin: { windowMs: 60000, max: 200 },
}
```

### 4. Audit Logging

```typescript
// Comprehensive security event logging
const auditLog = {
  authentication: (clientId: string, success: boolean, ip: string) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        type: 'auth',
        clientId,
        success,
        ip,
        level: success ? 'info' : 'warn',
      })
    )
  },

  toolAccess: (clientId: string, tool: string, scope: string[]) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        type: 'tool_access',
        clientId,
        tool,
        scope,
        level: 'info',
      })
    )
  },
}
```

## 🧪 Security Testing

### Authentication Testing

```bash
# Test without API key (should fail)
curl -X POST http://localhost:4000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Test with invalid API key (should fail)
curl -X POST http://localhost:4000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: invalid-key" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Test with valid read scope
curl -X POST http://localhost:4000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_read_abc123" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### Rate Limiting Testing

```bash
# Test rate limiting
for i in {1..110}; do
  curl -X POST http://localhost:4000/mcp \
    -H "Content-Type: application/json" \
    -H "X-API-Key: sk_read_abc123" \
    -d '{"jsonrpc":"2.0","id":'$i',"method":"tools/list"}'
done
```

### Session Security Testing

```bash
# Test session creation with authentication
SESSION_RESPONSE=$(curl -X POST http://localhost:4000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_write_def456" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"secure-test","version":"1.0.0"}}}' \
  -I)

# Extract session ID from response headers
SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -i mcp-session-id | cut -d' ' -f2 | tr -d '\r\n')

# Test session usage
curl -X POST http://localhost:4000/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_write_def456" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"status","arguments":{}}}'
```

## 🔐 Authorization Scopes

### Scope Definitions

- **read**: View tools, resources, and prompts
- **write**: Execute tools and modify data
- **admin**: Full access including system operations

### Scope Implementation

```typescript
// Tool authorization example
export const statusTool: ToolDefinition = {
  name: 'status',
  description: 'Get system status (admin only)',
  schema: z.object({}),
  handler: async (args, context) => {
    // Check authorization in context
    if (!context.auth?.scope.includes('admin')) {
      throw new Error('Admin scope required')
    }

    return {
      status: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    }
  },
  authorization: {
    requiredScope: 'admin',
  },
}
```

## 🎯 Use Cases

Perfect for:

- **Enterprise applications**: Production-ready security
- **Financial services**: Compliance and audit requirements
- **Healthcare systems**: HIPAA-compliant implementations
- **Government systems**: High-security environments
- **Multi-tenant SaaS**: Secure tenant isolation
- **API gateways**: Secure MCP protocol exposure

## 🔧 Development Commands

```bash
# Start development with security features
npm run dev

# Build for production
npm run build

# Start secure production server
npm start

# Run security tests
npm run test:security

# Generate API keys
npm run generate-keys

# Audit security configuration
npm run audit:security
```

## 🚀 Production Deployment

### Environment Variables

```bash
# Required security configuration
API_KEY_SECRET=your-256-bit-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret-for-session-tokens

# Optional HTTPS configuration
HTTPS_PORT=443
SSL_KEY_PATH=/path/to/private-key.pem
SSL_CERT_PATH=/path/to/certificate.pem

# Database configuration (for production key storage)
DATABASE_URL=postgresql://user:pass@localhost:5432/secure_mcp
REDIS_URL=redis://localhost:6379
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY --chown=nextjs:nodejs . .
RUN npm run build

# Switch to non-root user
USER nextjs

# Expose secure port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["npm", "start"]
```

## 🔍 Monitoring & Alerting

### Security Metrics

```typescript
// Security metrics collection
const securityMetrics = {
  authenticationFailures: 0,
  rateLimitExceeded: 0,
  invalidApiKeys: 0,
  sessionViolations: 0,
}

// Alert thresholds
const alertThresholds = {
  authFailuresPerMinute: 10,
  rateLimitPerMinute: 50,
  invalidKeysPerHour: 100,
}
```

### Log Analysis Queries

```bash
# Failed authentication attempts
tail -f security.log | jq 'select(.type == "auth" and .success == false)'

# Rate limiting events
tail -f security.log | jq 'select(.type == "rate_limit")'

# Session security violations
tail -f security.log | jq 'select(.type == "session_violation")'
```

## 🔧 Customization

### Custom Authentication Provider

```typescript
// src/auth/custom-provider.ts
export class CustomAuthProvider {
  async validateToken(token: string): Promise<AuthResult> {
    // Integrate with your identity provider
    // Examples: Auth0, Okta, Azure AD, etc.
    return {
      valid: true,
      scopes: ['read', 'write'],
      clientId: 'custom-client',
    }
  }
}
```

### Advanced Rate Limiting

```typescript
// src/security/advanced-rate-limit.ts
export const advancedRateLimit = {
  keyGenerator: (req: Request) => {
    // Rate limit by API key + IP combination
    const apiKey = req.headers['x-api-key']
    const ip = req.ip
    return `${apiKey}:${ip}`
  },

  skipSuccessfulRequests: false,
  skipFailedRequests: true,

  onLimitReached: (req: Request, res: Response) => {
    auditLog.rateLimitExceeded(req.headers['x-api-key'] as string, req.ip)
  },
}
```

### Encryption Key Rotation

```typescript
// src/security/key-rotation.ts
export class EncryptionKeyManager {
  private keys: Map<string, string> = new Map()

  rotateKey(): string {
    const newKey = crypto.randomBytes(32).toString('hex')
    const keyId = crypto.randomUUID()
    this.keys.set(keyId, newKey)
    return keyId
  }

  getKey(keyId: string): string | undefined {
    return this.keys.get(keyId)
  }
}
```

## 📚 Documentation

- [DyneMCP Security Guide](https://dynemcp.dev/security)
- [Authentication & Authorization](https://dynemcp.dev/auth)
- [Production Security Checklist](https://dynemcp.dev/security/checklist)
- [Compliance Guidelines](https://dynemcp.dev/compliance)

## 🤝 Support

- GitHub Issues: Report security vulnerabilities responsibly
- Security Documentation: Comprehensive security guides
- Community: Share security best practices and configurations

## ⚠️ Security Notice

This template includes security features but requires proper configuration for production use. Always:

1. Use strong, unique secrets for all encryption keys
2. Implement proper key rotation policies
3. Configure HTTPS in production environments
4. Regular security audits and penetration testing
5. Monitor security logs and set up alerting
6. Follow your organization's security policies
