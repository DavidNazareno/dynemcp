# HTTP Server DyneMCP Template

A web-integrated MCP (Model Context Protocol) server template using HTTP transport. Perfect for web applications, REST APIs, and browser-based MCP clients.

## 🚀 What's Included

This template provides a complete HTTP-based MCP server foundation with:

- **Express.js Server**: Modern Node.js web server with middleware support
- **HTTP Transport**: RESTful MCP communication over HTTP
- **CORS Configuration**: Cross-origin resource sharing setup
- **Basic Tools**: Web-oriented tools and utilities
- **Server Resources**: Information about server status and capabilities
- **Introduction Prompts**: Getting started guidance for web integration
- **Health Checks**: Built-in endpoints for monitoring

## 📁 Project Structure

```
http-server-project/
├── src/
│   └── index.ts              # Main HTTP server entry point
├── tools/
│   └── greet.ts              # Web-friendly greeting tool
├── resources/
│   └── server-info.ts        # Server information resource
├── prompt/
│   └── introduction.ts       # Introduction and usage prompt
├── dynemcp.config.json       # HTTP transport configuration
├── package.json              # Dependencies including Express
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🌐 HTTP Transport Configuration

The template is configured to use HTTP transport by default:

```json
{
  "server": {
    "name": "my-http-server",
    "version": "1.0.0"
  },
  "transport": {
    "type": "http",
    "options": {
      "port": 3000,
      "host": "localhost"
    }
  },
  "tools": {
    "directory": "./tools"
  },
  "resources": {
    "directory": "./resources"
  },
  "prompts": {
    "directory": "./prompt"
  }
}
```

### HTTP Transport Features

- **RESTful API**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Communication**: Request/response bodies in JSON format
- **CORS Support**: Cross-origin requests for web browsers
- **Error Handling**: Proper HTTP status codes and error responses
- **Health Endpoints**: Built-in monitoring and status endpoints

## 🛠️ Included Tools

### Greeting Tool (`tools/greet.ts`)

A web-friendly greeting tool that demonstrates HTTP MCP interaction:

```typescript
import { ToolDefinition } from '@dynemcp/dynemcp'
import { z } from 'zod'

const GreetSchema = z.object({
  name: z.string().describe('Name of the person to greet'),
  style: z
    .enum(['casual', 'formal', 'friendly'])
    .optional()
    .describe('Greeting style'),
})

const greetTool: ToolDefinition = {
  name: 'greet',
  description: 'Generate a personalized greeting',
  schema: GreetSchema,
  handler: async ({ name, style = 'friendly' }) => {
    const greetings = {
      casual: `Hey ${name}! 👋`,
      formal: `Good day, ${name}.`,
      friendly: `Hello ${name}! Nice to meet you! 😊`,
    }

    return {
      message: greetings[style],
      timestamp: new Date().toISOString(),
      style,
    }
  },
}

export default greetTool
```

**Features**:

- Multiple greeting styles (casual, formal, friendly)
- Timestamp inclusion for web applications
- Emoji support for modern web interfaces
- Structured response format

## 📚 Server Resources

### Server Information (`resources/server-info.ts`)

Provides comprehensive server status and capabilities:

```typescript
import { ResourceDefinition } from '@dynemcp/dynemcp'

const serverInfoResource: ResourceDefinition = {
  uri: 'server://info',
  name: 'Server Information',
  description: 'HTTP server status and capabilities',
  content: async () => {
    return JSON.stringify(
      {
        server: {
          name: 'DyneMCP HTTP Server',
          version: '1.0.0',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform,
        },
        transport: {
          type: 'http',
          port: 3000,
          protocols: ['HTTP/1.1', 'HTTP/2'],
          cors: true,
        },
        capabilities: {
          tools: true,
          resources: true,
          prompts: true,
          streaming: false,
        },
        endpoints: {
          health: '/health',
          tools: '/tools',
          resources: '/resources',
          prompts: '/prompts',
        },
      },
      null,
      2
    )
  },
  contentType: 'application/json',
}

export default serverInfoResource
```

**Information Provided**:

- 🖥️ **Server Status**: Uptime, memory usage, platform
- 🌐 **Transport Details**: Port, protocols, CORS status
- 🔧 **Capabilities**: Available MCP features
- 📍 **Endpoints**: API endpoint mapping
- 📊 **Real-time Data**: Dynamic server metrics

## 💬 Introduction Prompt

### Web Integration Guide (`prompt/introduction.ts`)

Helpful prompt for getting started with web integration:

```typescript
import { PromptDefinition } from '@dynemcp/dynemcp'

const introductionPrompt: PromptDefinition = {
  id: 'web-introduction',
  name: 'Web Integration Guide',
  description: 'Getting started with HTTP MCP server',
  content: `Welcome to your HTTP-based MCP server! 

This server is perfect for web integration. Here's how to get started:

## Connection
Your server is running on HTTP at: http://localhost:3000

## Available Endpoints
- GET /health - Server health check
- POST /tools - Execute MCP tools
- GET /resources - Access server resources
- GET /prompts - Available prompts

## Example Usage
\`\`\`javascript
// Fetch server info
const response = await fetch('http://localhost:3000/resources/server://info')
const serverInfo = await response.json()

// Execute a tool
const greetResponse = await fetch('http://localhost:3000/tools/greet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'World', style: 'friendly' })
})
\`\`\`

## Web Integration
This server works great with:
- React/Vue/Angular applications
- REST API clients
- Webhook integrations
- Browser-based tools

Need help? Check the server-info resource for more details!`,
}

export default introductionPrompt
```

## 🚀 Quick Start

1. **Navigate to your project**:

   ```bash
   cd http-server-project
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the HTTP server**:

   ```bash
   npm run dev
   ```

4. **Test the server**:

   ```bash
   # Health check
   curl http://localhost:3000/health

   # Get server information
   curl http://localhost:3000/resources/server://info

   # Execute greeting tool
   curl -X POST http://localhost:3000/tools/greet \
     -H "Content-Type: application/json" \
     -d '{"name": "World", "style": "friendly"}'
   ```

## 🌐 HTTP API Endpoints

### Health Check

```http
GET /health
```

Returns server health status and basic information.

### Tools Execution

```http
POST /tools/{toolName}
Content-Type: application/json

{
  "parameter1": "value1",
  "parameter2": "value2"
}
```

### Resources Access

```http
GET /resources/{resourceUri}
```

Retrieve specific resources by URI.

### Prompts Listing

```http
GET /prompts
```

List all available prompts.

### Prompt Access

```http
GET /prompts/{promptId}
```

Retrieve specific prompt content.

## 🔧 Web Integration Examples

### React Integration

```typescript
// React component for MCP interaction
import React, { useState, useEffect } from 'react'

const MCPGreeting: React.FC = () => {
  const [greeting, setGreeting] = useState('')
  const [name, setName] = useState('')

  const handleGreet = async () => {
    try {
      const response = await fetch('http://localhost:3000/tools/greet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          style: 'friendly'
        })
      })

      const result = await response.json()
      setGreeting(result.message)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={handleGreet}>Greet</button>
      {greeting && <p>{greeting}</p>}
    </div>
  )
}

export default MCPGreeting
```

### JavaScript/Browser Integration

```html
<!DOCTYPE html>
<html>
  <head>
    <title>MCP Web Integration</title>
  </head>
  <body>
    <div id="app">
      <input type="text" id="nameInput" placeholder="Enter your name" />
      <button onclick="greetUser()">Greet</button>
      <div id="result"></div>
    </div>

    <script>
      async function greetUser() {
        const name = document.getElementById('nameInput').value

        try {
          const response = await fetch('http://localhost:3000/tools/greet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, style: 'friendly' }),
          })

          const result = await response.json()
          document.getElementById('result').innerHTML = result.message
        } catch (error) {
          console.error('Error:', error)
        }
      }
    </script>
  </body>
</html>
```

### Node.js Client

```typescript
// Node.js client for MCP server
import fetch from 'node-fetch'

class MCPClient {
  constructor(private baseUrl: string = 'http://localhost:3000') {}

  async executeTool(toolName: string, params: any) {
    const response = await fetch(`${this.baseUrl}/tools/${toolName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    return response.json()
  }

  async getResource(resourceUri: string) {
    const response = await fetch(
      `${this.baseUrl}/resources/${encodeURIComponent(resourceUri)}`
    )
    return response.json()
  }

  async getHealth() {
    const response = await fetch(`${this.baseUrl}/health`)
    return response.json()
  }
}

// Usage
const client = new MCPClient()

// Execute greeting tool
const greeting = await client.executeTool('greet', {
  name: 'Developer',
  style: 'casual',
})

console.log(greeting.message) // "Hey Developer! 👋"
```

## ⚙️ Configuration Options

### Advanced HTTP Configuration

```json
{
  "transport": {
    "type": "http",
    "options": {
      "port": 3000,
      "host": "0.0.0.0",
      "cors": {
        "allowOrigin": "*",
        "allowMethods": "GET,POST,PUT,DELETE",
        "allowHeaders": "Content-Type,Authorization",
        "exposeHeaders": "X-Total-Count",
        "maxAge": 86400
      },
      "middleware": {
        "morgan": true,
        "helmet": true,
        "compression": true
      },
      "rateLimit": {
        "windowMs": 900000,
        "max": 100
      }
    }
  }
}
```

### HTTPS Configuration

```json
{
  "transport": {
    "type": "http",
    "options": {
      "port": 443,
      "https": {
        "key": "./certs/private-key.pem",
        "cert": "./certs/certificate.pem"
      }
    }
  }
}
```

## 🛡️ Security Considerations

### CORS Configuration

```typescript
// Custom CORS configuration
const corsOptions = {
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}
```

### Rate Limiting

```typescript
// Rate limiting configuration
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
}
```

### Input Validation

```typescript
// Enhanced tool with validation
const secureGreetTool: ToolDefinition = {
  name: 'secure-greet',
  description: 'Secure greeting with input validation',
  schema: z.object({
    name: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[a-zA-Z\s]+$/)
      .describe('Name (letters and spaces only)'),
  }),
  handler: async ({ name }) => {
    // Additional sanitization
    const sanitizedName = name.trim().replace(/\s+/g, ' ')

    return {
      message: `Hello ${sanitizedName}!`,
      timestamp: new Date().toISOString(),
    }
  },
}
```

## 📊 Monitoring and Logging

### Health Check Endpoint

```typescript
// Enhanced health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  })
})
```

### Request Logging

```typescript
// Morgan logging configuration
app.use(
  morgan('combined', {
    stream: {
      write: (message) => {
        console.log(message.trim())
      },
    },
  })
)
```

## 🔧 Customization

### Adding New Web Tools

```typescript
// src/tools/web-scraper.ts
import { ToolDefinition } from '@dynemcp/dynemcp'
import { z } from 'zod'

const WebScraperSchema = z.object({
  url: z.string().url().describe('URL to scrape'),
  selector: z.string().optional().describe('CSS selector'),
})

const webScraperTool: ToolDefinition = {
  name: 'web-scraper',
  description: 'Extract content from web pages',
  schema: WebScraperSchema,
  handler: async ({ url, selector = 'title' }) => {
    // Implementation for web scraping
    // Note: Add proper error handling and respect robots.txt

    return {
      url,
      content: 'Scraped content here',
      timestamp: new Date().toISOString(),
    }
  },
}

export default webScraperTool
```

### Adding WebSocket Support

```typescript
// WebSocket integration
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    try {
      const request = JSON.parse(data.toString())
      // Handle MCP request over WebSocket
      const response = await handleMCPRequest(request)
      ws.send(JSON.stringify(response))
    } catch (error) {
      ws.send(JSON.stringify({ error: error.message }))
    }
  })
})
```

### Adding GraphQL Support

```typescript
// GraphQL integration
import { ApolloServer } from 'apollo-server-express'
import { typeDefs, resolvers } from './graphql-schema'

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    mcpClient: createMCPContext(req),
  }),
})

await apolloServer.start()
apolloServer.applyMiddleware({ app, path: '/graphql' })
```

## 🧪 Testing

### API Testing with curl

```bash
# Test all endpoints
curl http://localhost:3000/health
curl http://localhost:3000/resources/server://info
curl -X POST http://localhost:3000/tools/greet \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "style": "formal"}'
```

### Automated Testing

```typescript
// Jest test example
import request from 'supertest'
import app from '../src/index'

describe('HTTP MCP Server', () => {
  test('health check', async () => {
    const response = await request(app).get('/health').expect(200)

    expect(response.body.status).toBe('healthy')
  })

  test('greet tool', async () => {
    const response = await request(app)
      .post('/tools/greet')
      .send({ name: 'Test', style: 'casual' })
      .expect(200)

    expect(response.body.message).toContain('Hey Test!')
  })
})
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Production Configuration

```json
{
  "transport": {
    "type": "http",
    "options": {
      "port": 3000,
      "host": "0.0.0.0",
      "cors": {
        "allowOrigin": "https://yourdomain.com"
      },
      "middleware": {
        "helmet": true,
        "compression": true
      }
    }
  }
}
```

## 🔗 Related Templates

- **Default**: For basic MCP learning with stdio transport
- **Calculator**: For mathematical operations over HTTP
- **Secure Agent**: For production HTTP servers with authentication
- **Dynamic Agent**: For adaptive systems with HTTP integration

## 🤝 Contributing

Web-focused improvements are welcome!

1. Fork the repository
2. Add new web tools or improve HTTP integration
3. Include comprehensive tests
4. Update documentation
5. Submit a pull request

## 📄 License

This template is part of the DyneMCP project and is licensed under the MIT License.

## 🔗 Links

- [DyneMCP Framework](https://github.com/dynemcp/dynemcp)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Express.js Documentation](https://expressjs.com/)
- [Create DyneMCP CLI](https://www.npmjs.com/package/@dynemcp/create-dynemcp)
