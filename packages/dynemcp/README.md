# @dynemcp/dynemcp

[![npm version](https://badge.fury.io/js/@dynemcp%2Fdynemcp.svg)](https://badge.fury.io/js/@dynemcp%2Fdynemcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Complete MCP framework with server runtime and build system

The main DyneMCP framework provides everything you need to build, run, and deploy Model Context Protocol (MCP) servers with modern TypeScript development tools.

## 🚀 Features

- ⚡ **Full MCP server runtime**: Complete implementation of the MCP specification
- 🏗️ **Optimized build system**: Ultra-fast builds with esbuild
- 🔄 **Hot reload development**: Instant feedback during development
- 📝 **Declarative configuration**: Simple JSON-based configuration
- 🌐 **Multiple transports**: stdio, HTTP, SSE, and HTTP-Stream
- 🔧 **Dynamic registry**: Runtime registration of tools/resources/prompts
- 🎯 **Model sampling**: Built-in support for LLM model sampling
- 🔒 **Security features**: Authentication, rate limiting, CORS, and more
- 📊 **Performance monitoring**: Integrated metrics and performance tracking
- 🐛 **Advanced debugging**: Complete logging and debugging tools

## 📦 Installation

```bash
npm install @dynemcp/dynemcp
```

## 🚀 Quick Start

### Basic Server

```typescript
import { createMCPServer } from '@dynemcp/dynemcp'

const server = createMCPServer('my-server', './dynemcp.config.json', '1.0.0')

async function main() {
  await server.init()
  await server.start()
}

main().catch(console.error)
```

### Manual Configuration

```typescript
import { createMCPServer } from '@dynemcp/dynemcp'

const server = createMCPServer()

// Access configuration
const config = server.getConfig()

// Get server statistics
console.log(server.stats)

// Access registered components
console.log(server.tools)
console.log(server.resources)
console.log(server.prompts)
```

## 🛠️ Tools

Define tools that the MCP server can execute:

```typescript
import { DyneMCPTool } from '@dynemcp/dynemcp'
import { z } from 'zod'

const CalculatorSchema = z.object({
  a: z.number(),
  b: z.number(),
  operation: z.enum(['add', 'subtract', 'multiply', 'divide'])
})

export class CalculatorTool extends DyneMCPTool {
  get name() { return 'calculator' }
  readonly description = 'Basic calculator tool'
  readonly schema = CalculatorSchema

  async execute(input: z.infer<typeof CalculatorSchema>) {
    const { a, b, operation } = input
    switch (operation) {
      case 'add': return { result: a + b }
      case 'subtract': return { result: a - b }
      case 'multiply': return { result: a * b }
      case 'divide': 
        if (b === 0) throw new Error('Division by zero')
        return { result: a / b }
    }
  }
}

export default new CalculatorTool()
```

### Function-based tools

```typescript
import { z } from 'zod'
import { ToolDefinition } from '@dynemcp/dynemcp'

const greetTool: ToolDefinition = {
  name: 'greet',
  description: 'Greets someone',
  schema: z.object({
    name: z.string().describe('Name to greet')
  }),
  handler: async ({ name }) => {
    return `Hello, ${name}!`
  }
}

export default greetTool
```

## 📚 Resources

Define resources that provide data to models:

```typescript
import { ResourceDefinition } from '@dynemcp/dynemcp'

const docsResource: ResourceDefinition = {
  uri: 'docs://api',
  name: 'API Documentation', 
  description: 'Complete API documentation',
  content: async () => {
    // Dynamic content loading
    return await loadApiDocs()
  },
  contentType: 'text/markdown'
}

export default docsResource
```

### Static resources

```typescript
import { ResourceDefinition } from '@dynemcp/dynemcp'

const configResource: ResourceDefinition = {
  uri: 'config://server',
  name: 'Server Configuration',
  content: JSON.stringify({
    version: '1.0.0',
    features: ['tools', 'resources', 'prompts']
  }, null, 2),
  contentType: 'application/json'
}

export default configResource
```

## 💬 Prompts

Define reusable prompts for models:

```typescript
import { PromptDefinition } from '@dynemcp/dynemcp'

const codeReviewPrompt: PromptDefinition = {
  id: 'code-review',
  name: 'Code Review Assistant',
  description: 'Helps review code for best practices',
  content: `You are a senior engineer reviewing code.
Focus on:
- Quality and readability
- Performance implications
- Security considerations
- Best practices

Please provide constructive feedback.`
}

export default codeReviewPrompt
```

## 🔧 Build System

The framework includes a powerful build system to optimize your MCP servers:

### Using the CLI

```bash
# Development with hot reload
dynemcp dev

# Production build
dynemcp build

# Watch mode
dynemcp watch

# Clean artifacts
dynemcp clean

# Analyze bundle
dynemcp analyze
```

### Programmatic usage

```typescript
import { build, watch, BuildConfig } from '@dynemcp/dynemcp'

const config: BuildConfig = {
  input: './src/index.ts',
  output: './dist',
  target: 'node18',
  minify: true,
  sourcemap: true
}

// Single build
await build(config)

// Watch mode
await watch(config, (result) => {
  console.log('Build completed:', result)
})
```

## ⚙️ Configuration

### dynemcp.config.json

```json
{
  "server": {
    "name": "my-mcp-server",
    "version": "1.0.0",
    "documentationUrl": "https://example.com/docs"
  },
  "tools": {
    "enabled": true,
    "directory": "./src/tools",
    "pattern": "**/*.{ts,js}"
  },
  "resources": {
    "enabled": true,
    "directory": "./src/resources",
    "pattern": "**/*.{ts,js}"
  },
  "prompts": {
    "enabled": true,
    "directory": "./src/prompts",
    "pattern": "**/*.{ts,js}"
  },
  "transport": {
    "type": "stdio"
  },
  "logging": {
    "enabled": true,
    "level": "info",
    "format": "text",
    "timestamp": true,
    "colors": true
  },
  "debug": {
    "enabled": false,
    "verbose": false,
    "showComponentDetails": false,
    "showTransportDetails": false
  },
  "performance": {
    "maxConcurrentRequests": 100,
    "requestTimeout": 30000,
    "memoryLimit": "512mb",
    "enableMetrics": false
  },
  "security": {
    "enableValidation": true,
    "strictMode": false,
    "allowedOrigins": ["*"],
    "rateLimit": {
      "enabled": false,
      "maxRequests": 100,
      "windowMs": 900000
    }
  }
}
```

## 🌐 Transport Types

### stdio Transport (default)

```json
{
  "transport": {
    "type": "stdio"
  }
}
```

### HTTP Transport

```json
{
  "transport": {
    "type": "http",
    "options": {
      "port": 3000,
      "host": "localhost"
    }
  }
}
```

### SSE Transport

```json
{
  "transport": {
    "type": "sse",
    "options": {
      "port": 3000,
      "endpoint": "/sse",
      "messageEndpoint": "/message",
      "cors": {
        "allowOrigin": "*",
        "allowMethods": "GET,POST",
        "allowHeaders": "Content-Type"
      }
    }
  }
}
```

### HTTP-Stream Transport

```json
{
  "transport": {
    "type": "http-stream",
    "options": {
      "port": 4000,
      "responseMode": "stream",
      "authentication": {
        "path": "./src/auth.ts"
      },
      "session": {
        "enabled": true
      },
      "resumability": {
        "enabled": true
      }
    }
  }
}
```

## 🔧 Dynamic Registry

Register components at runtime:

```typescript
import { createMCPServer } from '@dynemcp/dynemcp'

const server = createMCPServer()

// Dynamically register tools
server.registry.registerTool({
  name: 'dynamic-tool',
  description: 'A dynamically registered tool',
  schema: z.object({}),
  handler: async () => 'Dynamic response'
})

// Register resources
server.registry.registerResource({
  uri: 'dynamic://resource',
  name: 'Dynamic Resource',
  content: 'Dynamic content'
})

// Register prompts
server.registry.registerPrompt({
  id: 'dynamic-prompt',
  name: 'Dynamic Prompt',
  content: 'Dynamic prompt content'
})
```

## 🎯 Model Sampling

Built-in support for LLM model sampling:

```typescript
import { createMCPServer } from '@dynemcp/dynemcp'

const server = createMCPServer()

// Enable sampling in your tools
const sampleTool: ToolDefinition = {
  name: 'sample-model',
  description: 'Samples a model for completion',
  schema: z.object({
    prompt: z.string(),
    maxTokens: z.number().optional()
  }),
  handler: async ({ prompt, maxTokens = 100 }) => {
    // Use built-in sampling capabilities
    const response = await server.sampleModel({
      messages: [{ role: 'user', content: prompt }],
      maxTokens
    })
    return response.content
  }
}
```

## 🔒 Security Features

### Authentication Middleware

```typescript
// auth.ts
import { Request, Response, NextFunction } from 'express'

export default function authenticate(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const token = req.headers.authorization
  
  if (!token || !isValidToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  next()
}
```

### Rate Limiting

```json
{
  "security": {
    "rateLimit": {
      "enabled": true,
      "maxRequests": 100,
      "windowMs": 900000
    }
  }
}
```

### CORS Configuration

```json
{
  "transport": {
    "type": "http-stream",
    "options": {
      "cors": {
        "allowOrigin": "https://trusted-domain.com",
        "allowMethods": "GET,POST",
        "allowHeaders": "Content-Type,Authorization",
        "exposeHeaders": "X-Rate-Limit-Remaining",
        "maxAge": 86400
      }
    }
  }
}
```

## 📊 Performance and Monitoring

### Integrated Metrics

```typescript
// Access performance metrics
const server = createMCPServer()
await server.init()

console.log(server.stats)
// {
//   tools: { count: 5, loaded: 5 },
//   resources: { count: 3, loaded: 3 },
//   prompts: { count: 2, loaded: 2 },
//   server: { name: 'my-server', version: '1.0.0' },
//   transport: 'stdio'
// }
```

### Performance Configuration

```json
{
  "performance": {
    "maxConcurrentRequests": 100,
    "requestTimeout": 30000,
    "memoryLimit": "512mb",
    "enableMetrics": true
  }
}
```

## 🐛 Debugging

### Environment Variables

```bash
# Enable debug logs on stderr
export DYNE_MCP_DEBUG_STDERR=1

# Silence stdio logs
export DYNE_MCP_STDIO_LOG_SILENT=1
```

### Debug Configuration

```json
{
  "debug": {
    "enabled": true,
    "verbose": true,
    "showComponentDetails": true,
    "showTransportDetails": true
  },
  "logging": {
    "enabled": true,
    "level": "debug",
    "format": "json",
    "timestamp": true
  }
}
```

## 🔧 CLI Commands

```bash
# Start development server
dynemcp dev

# Production build
dynemcp build

# Watch for changes
dynemcp watch

# Clean artifacts
dynemcp clean

# Analyze bundle size
dynemcp analyze

# Help
dynemcp --help
```

## 📖 API Reference

### createMCPServer()

```typescript
function createMCPServer(
  name?: string,
  configPath?: string,
  version?: string
): DyneMCP
```

### DyneMCP Class

```typescript
class DyneMCP {
  // Configuration
  getConfig(): DyneMCPConfig
  
  // Lifecycle
  async init(): Promise<void>
  async start(): Promise<void>
  async stop(): Promise<void>
  
  // Registry access
  readonly registry: Registry
  
  // Component access
  get tools(): ToolDefinition[]
  get resources(): ResourceDefinition[]
  get prompts(): PromptDefinition[]
  
  // Statistics
  get stats(): ServerStats
}
```

### Build Functions

```typescript
// Build functions
async function build(options: DyneMCPBuildOptions): Promise<BuildResult>
async function watch(options: DyneMCPBuildOptions): Promise<void>
async function buildCli(options: DyneMCPBuildOptions): Promise<BuildResult>
async function clean(outputDir: string): Promise<void>
async function analyze(options: DyneMCPBuildOptions): Promise<void>
```

## 🧪 Testing

```typescript
import { createMCPServer } from '@dynemcp/dynemcp'
import { describe, it, expect } from 'vitest'

describe('MCP Server', () => {
  it('should initialize correctly', async () => {
    const server = createMCPServer('test-server')
    await server.init()
    
    expect(server.stats.server.name).toBe('test-server')
    expect(server.tools.length).toBeGreaterThan(0)
  })
})
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Systemd Service

```ini
[Unit]
Description=DyneMCP Server
After=network.target

[Service]
Type=simple
User=dynemcp
WorkingDirectory=/opt/dynemcp
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🔗 Links

- [MCP Specification](https://modelcontextprotocol.io/)
- [GitHub Repository](https://github.com/dynemcp/dynemcp)
- [npm Package](https://www.npmjs.com/package/@dynemcp/dynemcp)
- [Documentation](https://dynemcp.dev)
