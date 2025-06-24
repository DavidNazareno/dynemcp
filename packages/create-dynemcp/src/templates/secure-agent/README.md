# Secure Agent Template - DyneMCP Project

> Production-ready MCP server with robust authentication, authorization, and enterprise-grade security measures.

## 🛡️ Description

This template creates an MCP server focused on enterprise security, ideal for:

- **Production Environments**: Secure configuration for enterprise deployments
- **Authenticated APIs**: Access control based on API keys
- **Critical Systems**: Robust validation and authorization
- **Compliance**: Security standards compliance

Includes API key authentication, security middleware, audit logging, and hardened configurations.

## 📁 Project Structure

```
secure-agent-project/
├── src/
│   ├── index.ts              # Secure MCP server
│   └── auth.ts               # Authentication middleware
├── tools/
│   └── status.ts             # Secure status tools
├── prompts/
│   └── security-context.ts   # Security context prompts
├── config/
│   ├── security.json         # Security configuration
│   └── permissions.json      # Permissions matrix
├── dynemcp.config.json       # Configuration with security enabled
├── package.json              # Dependencies with security libraries
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This documentation
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit security variables
echo "API_KEY=your-super-secret-key-here" >> .env
echo "JWT_SECRET=your-jwt-secret-here" >> .env
echo "ALLOWED_ORIGINS=https://yourapp.com,https://api.yourapp.com" >> .env
```

### 3. Start Secure Server

```bash
# Development mode (with security logs)
npm run dev

# The server will be protected and audited
```

### 4. Verify Security

```bash
# Test without authentication (should fail)
curl http://localhost:3000/mcp

# Test with authentication (should work)
curl http://localhost:3000/mcp \
  -H "X-API-Key: your-super-secret-key-here"
```

## 🔐 Authentication System

### API Key Authentication

The main authentication middleware:

```typescript
// src/auth.ts
export default function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key']

  // Validate API key presence
  if (!apiKey) {
    console.warn('🛑 Unauthorized: Missing API key', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    })
    return res.status(401).json({
      error: 'Unauthorized: API key required',
    })
  }

  // Validate API key
  if (apiKey !== process.env.API_KEY) {
    console.warn('🛑 Unauthorized: Invalid API key', {
      providedKey: apiKey.substring(0, 8) + '...',
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
    return res.status(401).json({
      error: 'Unauthorized: Invalid API key',
    })
  }

  console.log('✅ Client authenticated', {
    ip: req.ip,
    timestamp: new Date().toISOString(),
  })

  next()
}
```

### API Key Configuration

```bash
# Environment variables for production
API_KEY=prod-api-key-very-long-and-secure-12345
JWT_SECRET=super-secret-jwt-key-for-token-signing
ENCRYPTION_KEY=encryption-key-for-sensitive-data

# For development
API_KEY=dev-api-key-change-in-production
```

### API Key Rotation

```typescript
// Support for multiple API keys (rotation)
const validApiKeys = [
  process.env.API_KEY_PRIMARY,
  process.env.API_KEY_SECONDARY,
  process.env.API_KEY_LEGACY, // For transitions
].filter(Boolean)

function isValidApiKey(key: string): boolean {
  return validApiKeys.includes(key)
}
```

## 🛠️ Secure Tools

### Status Tool (`secure-status`)

Tool that provides secure system information:

```typescript
// tools/status.ts
const secureStatusTool: ToolDefinition = {
  name: 'secure-status',
  description: 'Returns secure system status information',
  schema: z.object({
    level: z
      .enum(['basic', 'detailed'])
      .default('basic')
      .describe('Level of detail in the status report'),
  }),
  handler: async ({ level }) => {
    const basicStatus = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }

    if (level === 'detailed') {
      return {
        ...basicStatus,
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          total:
            Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        },
        security: {
          authEnabled: true,
          corsEnabled: true,
          httpsOnly: process.env.NODE_ENV === 'production',
        },
      }
    }

    return basicStatus
  },
}
```

**Secure usage:**

```bash
# Basic status
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "secure-status",
      "arguments": {"level": "basic"}
    }
  }'
```

## 💬 Secure Prompts

### Security Context Prompt

Prompt that incorporates security context:

```typescript
// prompts/security-context.ts
const securityContextPrompt: PromptDefinition = {
  name: 'security-assistant',
  description: 'Security-aware assistant with audit logging',
  arguments: [
    {
      name: 'operation',
      description: 'Type of security operation to assist with',
      required: false,
    },
    {
      name: 'sensitivity',
      description: 'Data sensitivity level (public, internal, confidential)',
      required: false,
    },
  ],
  handler: async ({ operation = 'general', sensitivity = 'internal' }) => {
    // Audit log for prompt usage
    console.log('🔍 Security prompt accessed', {
      operation,
      sensitivity,
      timestamp: new Date().toISOString(),
      source: 'security-assistant-prompt',
    })

    const securityInstructions = {
      public: 'Information can be shared freely.',
      internal:
        'Information for internal use only. Do not expose sensitive details.',
      confidential:
        'Highly sensitive information. Minimize disclosure and log all access.',
    }

    return {
      messages: [
        {
          role: 'system',
          content: {
            type: 'text',
            text: `You are a security-aware assistant handling ${sensitivity} data.
                   
                   Security Guidelines:
                   - ${securityInstructions[sensitivity] || securityInstructions.internal}
                   - Always validate input for security threats
                   - Log security-relevant activities
                   - Follow least privilege principle
                   - Never expose API keys or sensitive configuration
                   
                   Operation Context: ${operation}`,
          },
        },
      ],
    }
  },
}
```

## ⚙️ Security Configuration

### `dynemcp.config.json`

```json
{
  "server": {
    "name": "dynemcp-secure-agent",
    "version": "1.0.0",
    "description": "Secure MCP agent with enterprise authentication"
  },
  "transport": {
    "type": "http",
    "port": 3000,
    "host": "localhost",
    "cors": {
      "enabled": true,
      "origin": ["https://yourdomain.com"],
      "credentials": true,
      "methods": ["POST", "OPTIONS"],
      "allowedHeaders": ["Content-Type", "X-API-Key"],
      "maxAge": 3600
    }
  },
  "security": {
    "authentication": {
      "type": "apikey",
      "middleware": "./src/auth.js",
      "required": true
    },
    "encryption": {
      "enabled": true,
      "algorithm": "aes-256-gcm"
    },
    "audit": {
      "enabled": true,
      "logFile": "./logs/audit.log",
      "logLevel": "info"
    },
    "rateLimit": {
      "enabled": true,
      "windowMs": 900000,
      "max": 100
    }
  },
  "tools": {
    "enabled": true,
    "directory": "./tools"
  },
  "prompts": {
    "enabled": true,
    "directory": "./prompts"
  },
  "build": {
    "entryPoint": "./src/index.ts",
    "outDir": "./dist",
    "bundle": true,
    "minify": true
  }
}
```

### Environment Variables

```bash
# .env for production
NODE_ENV=production
API_KEY=prod-very-long-secure-api-key-here
JWT_SECRET=jwt-secret-for-token-signing
ENCRYPTION_KEY=32-char-encryption-key-here

# Network configuration
PORT=3000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Log configuration
LOG_LEVEL=info
AUDIT_LOG_PATH=./logs/audit.log

# Security configuration
HTTPS_ONLY=true
SECURE_COOKIES=true
TRUST_PROXY=true
```

## 🔧 Implemented Security Measures

### 1. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for internal health checks
    return req.ip === '127.0.0.1' && req.path === '/health'
  },
})

app.use('/mcp', limiter)
```

### 2. Request Validation

```typescript
import { body, validationResult } from 'express-validator'

const validateJsonRpc = [
  body('jsonrpc').equals('2.0'),
  body('id').isNumeric(),
  body('method').isString().isLength({ min: 1, max: 100 }),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.warn('🛑 Invalid request format', {
        errors: errors.array(),
        ip: req.ip,
        timestamp: new Date().toISOString(),
      })
      return res.status(400).json({
        error: 'Invalid request format',
        details: errors.array(),
      })
    }
    next()
  },
]

app.post('/mcp', validateJsonRpc, mcpHandler)
```

### 3. Security Headers

```typescript
import helmet from 'helmet'

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
)

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), camera=(), microphone=()'
  )
  next()
})
```

### 4. Audit Logging

```typescript
// Audit logging system
class AuditLogger {
  static log(event: string, details: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: this.getSeverity(event),
    }

    console.log(`🔍 AUDIT: ${event}`, logEntry)

    // In production, write to file or logging service
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(logEntry)
    }
  }

  private static getSeverity(event: string): string {
    if (event.includes('unauthorized') || event.includes('failed')) {
      return 'HIGH'
    }
    if (event.includes('access') || event.includes('call')) {
      return 'MEDIUM'
    }
    return 'LOW'
  }
}

// Usage in middleware
app.use((req, res, next) => {
  AuditLogger.log('request_received', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })
  next()
})
```

## 🎯 Enterprise Use Cases

### 1. Secure Enterprise API

```bash
# Create API for enterprise system
create-dynemcp enterprise-api --template secure-agent
cd enterprise-api

# Configure production variables
echo "API_KEY=$(openssl rand -hex 32)" >> .env.production
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env.production
```

### 2. Microservice with Authentication

```bash
# Service requiring robust authentication
create-dynemcp auth-service --template secure-agent
```

**Docker Configuration:**

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Non-privileged user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S dynemcp -u 1001

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Switch to non-privileged user
USER dynemcp

EXPOSE 3000
CMD ["npm", "start"]
```

### 3. B2B Integration System

```bash
# For business-to-business integrations
create-dynemcp b2b-integration --template secure-agent
```

**Advanced configuration:**

```typescript
// Partner authentication
const partnerAuth = (req, res, next) => {
  const partnerId = req.headers['x-partner-id']
  const apiKey = req.headers['x-api-key']

  if (!isValidPartner(partnerId, apiKey)) {
    AuditLogger.log('unauthorized_partner_access', {
      partnerId,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
    return res.status(401).json({ error: 'Unauthorized partner' })
  }

  req.partner = { id: partnerId }
  next()
}
```

## 📝 Production Configuration

### 1. Secure Environment Variables

```bash
# Generate secure keys
API_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Production configuration
NODE_ENV=production
HTTPS_ONLY=true
TRUST_PROXY=true
LOG_LEVEL=warn
```

### 2. HTTPS Configuration

```typescript
// For production with HTTPS
import https from 'https'
import fs from 'fs'

if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  }

  https.createServer(options, app).listen(443, () => {
    console.log('🔒 HTTPS Server running on port 443')
  })
} else {
  app.listen(3000, () => {
    console.log('🔓 HTTP Server running on port 3000 (development)')
  })
}
```

### 3. Monitoring and Alerts

```typescript
// Security monitoring system
class SecurityMonitor {
  static failedAttempts = new Map()

  static recordFailedAuth(ip: string) {
    const count = this.failedAttempts.get(ip) || 0
    this.failedAttempts.set(ip, count + 1)

    if (count + 1 >= 5) {
      this.alertSuspiciousActivity(ip)
    }

    // Clear counters after 1 hour
    setTimeout(() => {
      this.failedAttempts.delete(ip)
    }, 3600000)
  }

  static alertSuspiciousActivity(ip: string) {
    console.error('🚨 SECURITY ALERT: Multiple failed auth attempts', {
      ip,
      attempts: this.failedAttempts.get(ip),
      timestamp: new Date().toISOString(),
    })

    // In production: send alert to security system
    // this.sendToSecuritySystem({ type: 'BRUTE_FORCE', ip })
  }
}
```

## 🏗️ Secure Production Build

### 1. Build with Security Optimizations

```bash
# Build with all optimizations
npm run build:secure
```

```json
// package.json scripts
{
  "scripts": {
    "build:secure": "npm run security-audit && npm run build",
    "security-audit": "npm audit --audit-level=moderate",
    "security-check": "npm run security-audit && npm run vulnerability-scan",
    "vulnerability-scan": "npx audit-ci"
  }
}
```

### 2. Security Verification

```bash
# Dependency audit
npm audit

# Vulnerability scan
npx audit-ci

# Verify security configuration
npm run security-check
```

### 3. Secure Deploy

```bash
# Environment variables for deploy
export NODE_ENV=production
export API_KEY=$(cat /secure/api-key)
export SSL_CERT_PATH=/ssl/cert.pem
export SSL_KEY_PATH=/ssl/private.key

# Deploy with non-privileged user
npm start
```

## 🧪 Security Testing

### 1. Authentication Tests

```bash
# Test without API key (should fail)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# Expected: 401 Unauthorized

# Test with invalid API key (should fail)
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: invalid-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# Expected: 401 Unauthorized

# Test with valid API key (should work)
curl -X POST http://localhost:3000/mcp \
  -H "X-API-Key: your-valid-api-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# Expected: 200 OK with tool list
```

### 2. Rate Limiting Tests

```bash
# Script to test rate limiting
for i in {1..110}; do
  curl -X POST http://localhost:3000/mcp \
    -H "X-API-Key: your-api-key" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":'$i',"method":"tools/list"}' &
done
wait

# After 100 requests should start returning 429
```

### 3. Security Headers Tests

```bash
# Check security headers
curl -I http://localhost:3000/health

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 🚀 Security Extensions

### 1. JWT Authentication

```bash
npm install jsonwebtoken
```

```typescript
import jwt from 'jsonwebtoken'

const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'JWT token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid JWT token' })
  }
}
```

### 2. Data Encryption

```bash
npm install crypto-js
```

```typescript
import CryptoJS from 'crypto-js'

class DataEncryption {
  static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString()
  }

  static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(
      encryptedData,
      process.env.ENCRYPTION_KEY
    )
    return bytes.toString(CryptoJS.enc.Utf8)
  }
}
```

### 3. OAuth 2.0 Integration

```bash
npm install passport passport-oauth2
```

```typescript
import passport from 'passport'
import OAuth2Strategy from 'passport-oauth2'

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: 'https://oauth-provider.com/oauth/authorize',
      tokenURL: 'https://oauth-provider.com/oauth/token',
      clientID: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      callbackURL: '/auth/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Validate user and create session
      return done(null, profile)
    }
  )
)
```

## 🤝 Contributing

Ideas to improve the template's security?

1. Fork the main repository
2. Modify the template in `packages/create-dynemcp/src/templates/secure-agent/`
3. Add new security measures
4. Include security tests
5. Submit a Pull Request

### Contribution Ideas

- New authentication methods
- Security best practices
- HSM/Vault integration
- Advanced logging systems
- Compliance with standards (SOC2, GDPR)

## 📄 License

MIT License - see [LICENSE](../../../../../LICENSE) for more details.

## 🔗 Useful Links

- [DyneMCP Framework](../../../dynemcp/README.md)
- [create-dynemcp generator](../../README.md)
- [Other templates](../)
- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MCP Documentation](https://modelcontextprotocol.io/)
