# @dynemcp/server-dynemcp

A powerful and flexible MCP (Model Context Protocol) server framework with automatic component discovery, class-based inheritance, schema validation, and multiple transport options.

## Features

- 🚀 **Automatic Component Discovery**: Tools, resources, and prompts are automatically loaded from their respective directories
- 🏗️ **Class-Based Architecture**: Use inheritance for better type safety and code organization
- ✅ **Schema Validation**: Built-in Zod schema validation with automatic type inference
- 🔄 **Multiple Transports**: Support for stdio, SSE, and HTTP Stream transports
- 📝 **Backward Compatibility**: Works with both class-based and traditional object-based components
- 🎯 **Next.js-like Structure**: Familiar directory structure and conventions
- 🔧 **Flexible Configuration**: Environment variables, config files, and programmatic configuration
- 🧩 **Modular Architecture**: Clean separation of concerns with dedicated modules

## Installation

```bash
npm install @dynemcp/server-dynemcp
```

## Quick Start

### 1. Create your project structure

```
src/
├── tools/
│   ├── calculator.ts
│   └── weather.ts
├── resources/
│   └── docs.ts
├── prompts/
│   └── system.ts
└── index.ts
```

### 2. Create your components

**Using Class-Based Approach (Recommended):**

```typescript
// src/tools/calculator.ts
import { DyneMCPTool, z } from '@dynemcp/server-dynemcp';

const CalculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number(),
});

export class CalculatorTool extends DyneMCPTool<typeof CalculatorSchema> {
  name = 'calculator';
  description = 'Perform basic mathematical operations';
  schema = CalculatorSchema;

  async execute({ operation, a, b }: z.infer<typeof CalculatorSchema>) {
    switch (operation) {
      case 'add':
        return { result: a + b };
      case 'subtract':
        return { result: a - b };
      case 'multiply':
        return { result: a * b };
      case 'divide':
        if (b === 0) throw new Error('Division by zero');
        return { result: a / b };
    }
  }
}

export default new CalculatorTool();
```

```typescript
// src/resources/docs.ts
import { DyneMCPResource } from '@dynemcp/server-dynemcp';

export class DocumentationResource extends DyneMCPResource {
  uri = 'https://example.com/docs';
  name = 'API Documentation';
  description = 'Complete API documentation';

  async getContent(): Promise<string> {
    return `# API Documentation

This is the complete API documentation for our service.

## Endpoints

- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

## Authentication

All requests require a valid API key in the Authorization header.`;
  }
}

export default new DocumentationResource();
```

```typescript
// src/prompts/system.ts
import { DyneMCPPrompt } from '@dynemcp/server-dynemcp';

export class SystemPrompt extends DyneMCPPrompt {
  id = 'system';
  name = 'System Instructions';
  description = 'Default system instructions for the AI';

  content = `You are a helpful AI assistant. You have access to various tools and resources to help users with their tasks.

Guidelines:
- Always be helpful and accurate
- Use available tools when appropriate
- Provide clear explanations
- Ask for clarification when needed`;
}

export default new SystemPrompt();
```

### 3. Create your server

```typescript
// src/index.ts
import { createMCPServer } from '@dynemcp/server-dynemcp';

const server = createMCPServer('my-mcp-server');

async function main() {
  await server.start();
}

main().catch(console.error);
```

### 4. Run your server

```bash
# Using stdio transport (default)
node dist/index.js

# Using SSE transport
DYNEMCP_TRANSPORT_TYPE=sse DYNEMCP_SSE_PORT=8080 node dist/index.js

# Using HTTP Stream transport
DYNEMCP_TRANSPORT_TYPE=http-stream DYNEMCP_HTTP_PORT=8080 node dist/index.js
```

## Configuration

### Configuration File

Create a `dynemcp.config.json` file:

```json
{
  "server": {
    "name": "my-mcp-server",
    "version": "1.0.0"
  },
  "tools": {
    "enabled": true,
    "directory": "src/tools",
    "pattern": "**/*.{ts,js}"
  },
  "resources": {
    "enabled": true,
    "directory": "src/resources",
    "pattern": "**/*.{ts,js}"
  },
  "prompts": {
    "enabled": true,
    "directory": "src/prompts",
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
  },
  "config": {
    "env": true
  }
}
```

### Environment Variables

```bash
# Server configuration
DYNEMCP_SERVER_NAME=my-mcp-server
DYNEMCP_SERVER_VERSION=1.0.0

# Component directories
DYNEMCP_TOOLS_DIR=src/tools
DYNEMCP_RESOURCES_DIR=src/resources
DYNEMCP_PROMPTS_DIR=src/prompts

# Component patterns
DYNEMCP_TOOLS_PATTERN=**/*.{ts,js}
DYNEMCP_RESOURCES_PATTERN=**/*.{ts,js}
DYNEMCP_PROMPTS_PATTERN=**/*.{ts,js}

# Component enabled flags
DYNEMCP_TOOLS_ENABLED=true
DYNEMCP_RESOURCES_ENABLED=true
DYNEMCP_PROMPTS_ENABLED=true

# Logging configuration
DYNEMCP_LOGGING_ENABLED=true
DYNEMCP_LOGGING_LEVEL=info
DYNEMCP_LOGGING_FORMAT=text

# Debug configuration
DYNEMCP_DEBUG_ENABLED=false
DYNEMCP_DEBUG_VERBOSE=false

# Performance configuration
DYNEMCP_PERFORMANCE_MAX_CONCURRENT_REQUESTS=100
DYNEMCP_PERFORMANCE_REQUEST_TIMEOUT=30000
DYNEMCP_PERFORMANCE_MEMORY_LIMIT=512mb

# Security configuration
DYNEMCP_SECURITY_ENABLE_VALIDATION=true
DYNEMCP_SECURITY_STRICT_MODE=false
DYNEMCP_SECURITY_ALLOWED_ORIGINS=*

# Transport configuration
DYNEMCP_TRANSPORT_TYPE=stdio|sse|http-stream

# SSE transport options
DYNEMCP_SSE_PORT=8080
DYNEMCP_SSE_ENDPOINT=/sse
DYNEMCP_SSE_MESSAGE_ENDPOINT=/messages

# HTTP Stream transport options
DYNEMCP_HTTP_PORT=8080
DYNEMCP_HTTP_ENDPOINT=/mcp
DYNEMCP_HTTP_RESPONSE_MODE=batch|stream
DYNEMCP_HTTP_BATCH_TIMEOUT=30000
DYNEMCP_HTTP_MAX_MESSAGE_SIZE=4mb
```

### Configuration Options

#### Server Configuration
- `server.name`: Name of the MCP server
- `server.version`: Version of the MCP server

#### Component Configuration
- `tools.enabled`: Enable/disable tool loading
- `tools.directory`: Directory to scan for tools
- `tools.pattern`: Glob pattern for tool files
- `resources.enabled`: Enable/disable resource loading
- `resources.directory`: Directory to scan for resources
- `resources.pattern`: Glob pattern for resource files
- `prompts.enabled`: Enable/disable prompt loading
- `prompts.directory`: Directory to scan for prompts
- `prompts.pattern`: Glob pattern for prompt files

#### Logging Configuration
- `logging.enabled`: Enable/disable logging
- `logging.level`: Log level (error, warn, info, debug)
- `logging.format`: Log format (json, text)
- `logging.timestamp`: Include timestamps in logs
- `logging.colors`: Enable colored output

#### Debug Configuration
- `debug.enabled`: Enable debug mode
- `debug.verbose`: Enable verbose output
- `debug.showComponentDetails`: Show detailed component information
- `debug.showTransportDetails`: Show detailed transport information

#### Performance Configuration
- `performance.maxConcurrentRequests`: Maximum concurrent requests
- `performance.requestTimeout`: Request timeout in milliseconds
- `performance.memoryLimit`: Memory limit for the server
- `performance.enableMetrics`: Enable performance metrics

#### Security Configuration
- `security.enableValidation`: Enable schema validation
- `security.strictMode`: Enable strict mode
- `security.allowedOrigins`: Allowed CORS origins
- `security.rateLimit.enabled`: Enable rate limiting
- `security.rateLimit.maxRequests`: Maximum requests per window
- `security.rateLimit.windowMs`: Rate limit window in milliseconds

### Advanced Configuration Examples

#### Production Configuration
```json
{
  "server": {
    "name": "production-mcp-server",
    "version": "1.0.0"
  },
  "tools": {
    "enabled": true,
    "directory": "src/tools",
    "pattern": "**/*.ts"
  },
  "resources": {
    "enabled": true,
    "directory": "src/resources",
    "pattern": "**/*.ts"
  },
  "prompts": {
    "enabled": true,
    "directory": "src/prompts",
    "pattern": "**/*.ts"
  },
  "transport": {
    "type": "http-stream",
    "options": {
      "port": 8080,
      "responseMode": "stream",
      "session": {
        "enabled": true,
        "allowClientTermination": true
      },
      "cors": {
        "allowOrigin": "https://myapp.com",
        "allowMethods": "GET, POST, OPTIONS"
      }
    }
  },
  "logging": {
    "enabled": true,
    "level": "warn",
    "format": "json",
    "timestamp": true,
    "colors": false
  },
  "debug": {
    "enabled": false,
    "verbose": false
  },
  "performance": {
    "maxConcurrentRequests": 200,
    "requestTimeout": 60000,
    "memoryLimit": "1gb",
    "enableMetrics": true
  },
  "security": {
    "enableValidation": true,
    "strictMode": true,
    "allowedOrigins": ["https://myapp.com", "https://admin.myapp.com"],
    "rateLimit": {
      "enabled": true,
      "maxRequests": 1000,
      "windowMs": 900000
    }
  }
}
```

#### Development Configuration
```json
{
  "server": {
    "name": "dev-mcp-server",
    "version": "0.1.0"
  },
  "tools": {
    "enabled": true,
    "directory": "src/tools",
    "pattern": "**/*.{ts,js}"
  },
  "resources": {
    "enabled": true,
    "directory": "src/resources",
    "pattern": "**/*.{ts,js}"
  },
  "prompts": {
    "enabled": true,
    "directory": "src/prompts",
    "pattern": "**/*.{ts,js}"
  },
  "transport": {
    "type": "stdio"
  },
  "logging": {
    "enabled": true,
    "level": "debug",
    "format": "text",
    "timestamp": true,
    "colors": true
  },
  "debug": {
    "enabled": true,
    "verbose": true,
    "showComponentDetails": true,
    "showTransportDetails": true
  },
  "performance": {
    "maxConcurrentRequests": 50,
    "requestTimeout": 30000,
    "memoryLimit": "256mb",
    "enableMetrics": false
  },
  "security": {
    "enableValidation": true,
    "strictMode": false,
    "allowedOrigins": ["*"],
    "rateLimit": {
      "enabled": false
    }
  }
}
```

#### Minimal Configuration
```json
{
  "server": {
    "name": "simple-mcp-server",
    "version": "1.0.0"
  },
  "tools": {
    "directory": "src/tools"
  },
  "resources": {
    "directory": "src/resources"
  },
  "prompts": {
    "directory": "src/prompts"
  }
}
```

## Transport Options

### 1. Stdio Transport (Default)

Simple and efficient for local development and CLI tools.

```typescript
const server = createMCPServer('my-server', undefined, undefined, {
  transport: { type: 'stdio' }
});
```

### 2. SSE Transport

Server-Sent Events for real-time communication.

```typescript
const server = createMCPServer('my-server', undefined, undefined, {
  transport: {
    type: 'sse',
    options: {
      port: 8080,
      endpoint: '/sse',
      messageEndpoint: '/messages',
      cors: {
        allowOrigin: '*',
        allowMethods: 'GET, POST, OPTIONS',
        allowHeaders: 'Content-Type, Authorization',
      }
    }
  }
});
```

### 3. HTTP Stream Transport

HTTP-based streaming with advanced features like sessions and resumability.

```typescript
const server = createMCPServer('my-server', undefined, undefined, {
  transport: {
    type: 'http-stream',
    options: {
      port: 8080,
      endpoint: '/mcp',
      responseMode: 'stream',
      batchTimeout: 30000,
      maxMessageSize: '4mb',
      session: {
        enabled: true,
        headerName: 'Mcp-Session-Id',
        allowClientTermination: true,
      },
      resumability: {
        enabled: false,
        historyDuration: 300000,
      },
      cors: {
        allowOrigin: '*',
        allowMethods: 'GET, POST, OPTIONS',
        allowHeaders: 'Content-Type, Authorization',
      }
    }
  }
});
```

## Traditional Object-Based Components

For backward compatibility, you can still use the traditional approach:

```typescript
// src/tools/calculator.ts
export default {
  name: 'calculator',
  description: 'Perform basic mathematical operations',
  schema: {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
      a: { type: 'number' },
      b: { type: 'number' },
    },
    required: ['operation', 'a', 'b'],
  },
  handler: async ({ operation, a, b }) => {
    switch (operation) {
      case 'add':
        return { result: a + b };
      case 'subtract':
        return { result: a - b };
      case 'multiply':
        return { result: a * b };
      case 'divide':
        if (b === 0) throw new Error('Division by zero');
        return { result: a / b };
    }
  },
};
```

## API Reference

### DyneMCP Class

```typescript
class DyneMCP {
  constructor(name?: string, configPath?: string, version?: string);
  
  // Initialize and start the server
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  
  // Get server information
  get stats(): ServerStats;
  get tools(): ToolDefinition[];
  get resources(): ResourceDefinition[];
  get prompts(): PromptDefinition[];
}
```

### Base Classes

```typescript
// Tool base class
abstract class DyneMCPTool<T extends z.ZodSchema> {
  abstract name: string;
  abstract description: string;
  abstract schema: T;
  abstract execute(input: z.infer<T>): Promise<any> | any;
}

// Resource base class
abstract class DyneMCPResource {
  abstract uri: string;
  abstract name: string;
  abstract description?: string;
  abstract getContent(): Promise<string> | string;
}

// Prompt base class
abstract class DyneMCPPrompt {
  abstract id: string;
  abstract name: string;
  abstract description?: string;
  abstract content: string;
}
```

### Validation Utilities

```typescript
// Validate a single tool schema
validateToolSchema(schema: z.ZodType, toolName: string): void;

// Validate all registered tools
validateAllTools(tools: Array<{ name: string; schema: any }>): void;

// Define a schema with description
defineSchema<T extends z.ZodSchema>(schema: T): T;
```

### Helper Functions

```typescript
// Create components programmatically
helpers.createTool(name, description, schema, handler);
helpers.createFileResource(filePath, options);
helpers.createDynamicResource(uri, name, generator, options);
helpers.createPrompt(id, name, content, options);
helpers.createSystemPrompt(id, name, content, options);
helpers.createChatPrompt(id, name, messages, options);
```

## Architecture

The framework follows a modular architecture with clear separation of concerns: