# HTTP Server DyneMCP Template

A full-featured MCP (Model Context Protocol) server template using **Streamable HTTP transport** with advanced features - perfect for production web services and complex integrations.

## 🚀 What's Included

This template provides a comprehensive HTTP-based MCP server with:

- **Complete Streamable HTTP Implementation**: All transport features enabled
- **Session Management**: Stateful connections with lifecycle management
- **Resumability**: Connection recovery with event replay
- **Health Checks**: Production-ready monitoring endpoints
- **CORS Support**: Cross-origin resource sharing configuration
- **Compression**: Efficient data transfer with gzip compression
- **Advanced Logging**: JSON-structured logging for production
- **Performance Metrics**: Built-in performance monitoring

## 🔌 Transport: Streamable HTTP (Full Featured)

This template uses **Streamable HTTP transport** with all features enabled, ideal for:

- **Production deployments**: Enterprise-ready HTTP services
- **Web applications**: Full browser integration support
- **Microservices**: Service-to-service communication
- **Load balancing**: Scalable multi-instance deployments
- **Long-running sessions**: Stateful interactions with resumability

### How it works:

- HTTP requests to `/mcp` endpoint
- Session-based connections with unique IDs
- Event streaming with resumability support
- Health check endpoint at `/health`
- Automatic session cleanup and management
- Compression for efficient data transfer

## 📁 Project Structure

```
http-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/                # HTTP service tools
│   │   └── greet.ts          # HTTP greeting service
│   ├── resources/            # Server information resources
│   │   └── server-info.ts    # Server status and info
│   └── prompts/              # HTTP-related prompts
│       └── introduction.ts   # Service introduction
├── dynemcp.config.json       # Full Streamable HTTP config
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## 🔧 Quick Start

1. **Navigate to your project directory**:

   ```bash
   cd http-server
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Build the project**:

   ```bash
   npm run build
   ```

4. **Start the HTTP server**:

   ```bash
   npm start
   ```

5. **Verify server is running**:

   ```bash
   # Check health endpoint
   curl http://localhost:3000/health

   # Test MCP endpoint
   curl -X POST http://localhost:3000/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "initialize",
       "params": {
         "protocolVersion": "2024-11-05",
         "capabilities": {},
         "clientInfo": {"name": "test-client", "version": "1.0.0"}
       }
     }'
   ```

## 🛠️ Streamable HTTP Transport Configuration

The `dynemcp.config.json` includes all Streamable HTTP features:

```json
{
  "transport": {
    "type": "streamable-http",
    "options": {
      "port": 3000,
      "host": "localhost",
      "endpoint": "/mcp",
      "responseMode": "batch",
      "session": {
        "enabled": true,
        "headerName": "Mcp-Session-Id",
        "allowClientTermination": true,
        "maxDuration": 1800000,
        "cleanup": {
          "enabled": true,
          "interval": 300000
        }
      },
      "resumability": {
        "enabled": true,
        "historyDuration": 300000,
        "headerName": "Last-Event-ID"
      },
      "cors": {
        "allowOrigin": "*",
        "allowMethods": "GET, POST, OPTIONS, DELETE",
        "allowHeaders": "Content-Type, Authorization, Mcp-Session-Id, Last-Event-ID",
        "exposeHeaders": "Content-Type, Mcp-Session-Id",
        "maxAge": 86400,
        "credentials": false
      },
      "healthCheck": {
        "enabled": true,
        "endpoint": "/health"
      },
      "maxMessageSize": "5mb",
      "compression": {
        "enabled": true,
        "threshold": 1024
      }
    }
  }
}
```

### Transport Features:

- ✅ **Session Management**: Stateful connections with cleanup
- ✅ **Resumability**: Connection recovery with event replay
- ✅ **Health Checks**: Monitoring and status endpoints
- ✅ **CORS Support**: Cross-origin resource sharing
- ✅ **Compression**: Efficient data transfer
- ✅ **Large Messages**: Support for large payloads (5MB)
- ✅ **Auto Cleanup**: Automatic session lifecycle management
- ✅ **Production Ready**: Enterprise-grade reliability

## 🌐 HTTP Endpoints

### MCP Protocol Endpoint

- **POST** `/mcp` - Main MCP protocol communication
- **GET** `/mcp` - Session management and events (when session enabled)
- **DELETE** `/mcp` - Session termination
- **OPTIONS** `/mcp` - CORS preflight requests

### Health Check Endpoint

- **GET** `/health` - Server health and status information

## 🔄 Session Management

### Creating a Session

```bash
# Initialize with session creation
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "client", "version": "1.0.0"}
    }
  }'

# Response includes session ID in headers:
# Mcp-Session-Id: uuid-session-id
```

### Using Session

```bash
# Subsequent requests with session ID
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: your-session-id" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

### Resuming Connection

```bash
# Resume with last event ID
curl -X GET http://localhost:3000/mcp \
  -H "Mcp-Session-Id: your-session-id" \
  -H "Last-Event-ID: last-received-event-id" \
  -H "Accept: text/event-stream"
```

### Terminating Session

```bash
# Explicitly terminate session
curl -X DELETE http://localhost:3000/mcp \
  -H "Mcp-Session-Id: your-session-id"
```

## 📊 Health Monitoring

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600000,
  "version": "1.0.0",
  "sessions": {
    "active": 5,
    "total": 23
  },
  "memory": {
    "used": "45.2 MB",
    "free": "466.8 MB"
  }
}
```

## 🧪 Testing

### Basic Health Check

```bash
curl http://localhost:3000/health
```

### Session Flow Testing

```bash
# 1. Initialize session
SESSION_ID=$(curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' \
  -I | grep -i mcp-session-id | cut -d' ' -f2 | tr -d '\r\n')

# 2. List tools with session
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# 3. Terminate session
curl -X DELETE http://localhost:3000/mcp \
  -H "Mcp-Session-Id: $SESSION_ID"
```

### Browser Integration

```javascript
// Modern fetch API with session management
class MCPClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.sessionId = null
  }

  async initialize() {
    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'web-client', version: '1.0.0' },
        },
      }),
    })

    this.sessionId = response.headers.get('Mcp-Session-Id')
    return response.json()
  }

  async callTool(name, arguments) {
    return fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': this.sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name, arguments },
      }),
    }).then((r) => r.json())
  }

  async terminate() {
    return fetch(`${this.baseUrl}/mcp`, {
      method: 'DELETE',
      headers: { 'Mcp-Session-Id': this.sessionId },
    })
  }
}

// Usage
const client = new MCPClient('http://localhost:3000')
await client.initialize()
const result = await client.callTool('greet', { name: 'World' })
await client.terminate()
```

## 🎯 Use Cases

Perfect for:

- **Web applications**: Full-featured browser integration
- **Microservices**: Service mesh communication
- **API gateways**: MCP protocol adaptation
- **Enterprise integration**: Production-ready deployments
- **Load-balanced services**: Multi-instance scalability
- **Long-running sessions**: Stateful user interactions

## 🔧 Development Commands

```bash
# Start development with watch mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Health check monitoring
npm run health

# Type checking
npm run typecheck

# Lint code
npm run lint
```

## 🚀 Next Steps

Want even more advanced features? Try:

- **secure-agent template**: Authentication, authorization, and security
- **dynamic-agent template**: Advanced session features and AI capabilities

## 🔧 Customization

### Adding Custom Headers

```typescript
// src/middleware/custom-headers.ts
export const customHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader('X-Service-Name', 'MyMCPService')
  res.setHeader('X-Version', '1.0.0')
  next()
}
```

### Custom Health Checks

```typescript
// src/health/custom-health.ts
export const customHealthCheck = async () => {
  // Add custom health logic
  const dbStatus = await checkDatabaseConnection()
  const cacheStatus = await checkCacheConnection()

  return {
    database: dbStatus ? 'healthy' : 'unhealthy',
    cache: cacheStatus ? 'healthy' : 'unhealthy',
  }
}
```

### Session Event Handlers

```typescript
// src/session/handlers.ts
export const sessionHandlers = {
  onSessionCreate: (sessionId: string) => {
    console.log(`Session created: ${sessionId}`)
  },

  onSessionTerminate: (sessionId: string) => {
    console.log(`Session terminated: ${sessionId}`)
  },

  onSessionExpire: (sessionId: string) => {
    console.log(`Session expired: ${sessionId}`)
  },
}
```

## 🔍 Monitoring & Observability

### Metrics Collection

```bash
# Built-in metrics endpoint (if enabled)
curl http://localhost:3000/metrics

# Custom health checks with detailed info
curl http://localhost:3000/health?detailed=true
```

### Log Analysis

```bash
# Structured JSON logs for production
tail -f server.log | jq '.timestamp, .level, .message'

# Filter by session
tail -f server.log | jq 'select(.sessionId == "specific-session-id")'
```

## 📚 Documentation

- [DyneMCP Documentation](https://dynemcp.dev)
- [Streamable HTTP Transport Guide](https://dynemcp.dev/transport/streamable-http)
- [Session Management](https://dynemcp.dev/features/sessions)
- [Production Deployment](https://dynemcp.dev/deployment/production)

## 🤝 Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Complete HTTP transport guides
- Community: Share production deployment experiences
