# Calculator DyneMCP Template

A mathematical MCP (Model Context Protocol) server template using **Streamable HTTP transport** - perfect for learning web-based MCP integration and mathematical operations.

## 🚀 What's Included

This template provides advanced mathematical capabilities with:

- **Basic Calculator**: Addition, subtraction, multiplication, division
- **Advanced Calculator**: Scientific functions, trigonometry, logarithms
- **Math Context**: Mathematical constants and formulas
- **Streamable HTTP Transport**: Modern web-compatible MCP communication
- **Stateless Operation**: Simple HTTP request/response pattern
- **Mathematical Resources**: Constants, formulas, and documentation

## 🚀 Development Modes

DyneMCP provides multiple development modes to make your workflow easier:

### Available Scripts

- **`npm run dev`** - Start development server (uses transport from config)
- **`npm run inspector`** - Start development server with MCP Inspector

### Mode Details

- **`npm run dev`**: Starts the development server using the transport configured in `dynemcp.config.json`
- **`npm run inspector`**: Automatically launches the MCP Inspector along with your server. The Inspector intelligently handles both stdio and HTTP transports:
  - For **stdio transport**: Inspector manages the server process directly
  - For **HTTP transport**: Server starts first, then Inspector connects to the HTTP endpoint

## 🔌 Transport: Streamable HTTP (Basic)

This template uses **Streamable HTTP transport** in basic mode, ideal for:

- **Web integration**: Direct HTTP API access
- **REST-like patterns**: Familiar request/response model
- **Simple deployment**: No complex session management
- **Testing**: Easy to test with standard HTTP tools

### How it works:

- HTTP requests to `/mcp` endpoint
- JSON-RPC over HTTP
- Stateless operation (no sessions)
- CORS support for web clients
- Batch response mode for efficiency

## 📁 Project Structure

```
calculator-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/                # Mathematical tools
│   │   ├── basic-calculator.ts    # Basic arithmetic
│   │   └── advanced-calculator.ts # Scientific functions
│   ├── resources/            # Mathematical resources
│   └── prompts/              # Math-related prompts
│       ├── calculator-prompt.ts   # Calculator assistance
│       └── math-context.ts        # Mathematical context
├── dynemcp.config.json       # Streamable HTTP configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## 🔧 Quick Start

1. **Navigate to your project directory**:

   ```bash
   cd calculator-server
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   # Start development server
   npm run dev

   # Or start with Inspector for debugging
   npm run inspector
   ```

4. **Production build and start**:
   ```bash
   npm run build
   npm start
   ```

## 🛠️ Streamable HTTP Transport Configuration

The `dynemcp.config.json` uses Streamable HTTP transport:

```json
{
  "transport": {
    "type": "streamable-http",
    "options": {
      "port": 3001,
      "host": "localhost",
      "endpoint": "/mcp",
      "responseMode": "batch",
      "session": {
        "enabled": false
      },
      "cors": {
        "allowOrigin": "*",
        "allowMethods": "GET, POST, OPTIONS",
        "allowHeaders": "Content-Type",
        "exposeHeaders": "Content-Type",
        "maxAge": 3600
      }
    }
  }
}
```

### Transport Features:

- ✅ **HTTP compatibility**: Standard web protocols
- ✅ **CORS support**: Web browser integration
- ✅ **Stateless**: Simple request/response pattern
- ✅ **Testing**: Easy to test with HTTP tools
- ✅ **Scalable**: Can handle multiple concurrent requests
- ❌ **No sessions**: Each request is independent
- ❌ **No resumability**: No connection state preservation

## 🧮 Mathematical Tools

### Basic Calculator

```typescript
// Available operations:
add(a: number, b: number)        // Addition
subtract(a: number, b: number)   // Subtraction
multiply(a: number, b: number)   // Multiplication
divide(a: number, b: number)     // Division
```

### Advanced Calculator

```typescript
// Scientific functions:
power(base: number, exponent: number)
sqrt(number: number)
sin(angle: number)    // Radians
cos(angle: number)    // Radians
tan(angle: number)    // Radians
log(number: number)   // Natural logarithm
log10(number: number) // Base-10 logarithm
```

## 🌐 Testing & Debugging

### Using MCP Inspector (Recommended)

The easiest way to test your calculator server is with the MCP Inspector:

```bash
# Start server with Inspector (works for any transport)
npm run inspector
```

The Inspector provides a GUI to:

- Browse available tools and resources
- Test tool calls with a visual interface
- View real-time MCP communication
- Debug your server implementation

### API Usage Examples (HTTP Mode)

When your server is configured for HTTP transport, you can also test with curl:

#### List Available Tools

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

#### Call Calculator Tool

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "add",
      "arguments": {
        "a": 15,
        "b": 25
      }
    }
  }'
```

#### Get Mathematical Constants

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "resources/read",
    "params": {
      "uri": "math://constants"
    }
  }'
```

## 🎯 Use Cases

Perfect for:

- Mathematical web services
- Educational platforms
- Scientific computing APIs
- Calculator widgets
- Engineering applications
- Research tools

## 🔧 Development Commands

```bash
# Start development with watch mode
npm run dev

# Build for production
npm run build

# Start HTTP server
npm start

# Type checking
npm run typecheck

# Lint code
npm run lint
```

## 🚀 Next Steps

Ready for more advanced features? Try:

- **dynamic-agent template**: Session management and resumability
- **http-server template**: Full Streamable HTTP features
- **secure-agent template**: Authentication and security

## 🧪 Testing

### With Browser DevTools

Open browser console and test:

```javascript
fetch('http://localhost:3001/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'multiply',
      arguments: { a: 7, b: 8 },
    },
  }),
})
  .then((r) => r.json())
  .then(console.log)
```

### Integration Testing

```bash
# Install testing tools
npm install --save-dev @types/supertest supertest

# Run integration tests
npm test
```

## 🔧 Customization

### Adding New Mathematical Functions

```typescript
// src/tools/custom-math.ts
import { ToolDefinition } from '@dynemcp/dynemcp'
import { z } from 'zod'

export const factorial: ToolDefinition = {
  name: 'factorial',
  description: 'Calculate factorial of a number',
  schema: z.object({
    n: z.number().int().min(0).describe('Non-negative integer'),
  }),
  handler: async ({ n }) => {
    if (n === 0 || n === 1) return { result: 1 }
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return { result }
  },
}
```

### Adding Mathematical Resources

```typescript
// src/resources/formulas.ts
import { ResourceDefinition } from '@dynemcp/dynemcp'

export const formulas: ResourceDefinition = {
  uri: 'math://formulas/geometry',
  name: 'Geometry Formulas',
  description: 'Common geometric formulas',
  content: JSON.stringify({
    circle: {
      area: 'π × r²',
      circumference: '2 × π × r',
    },
    triangle: {
      area: '(base × height) / 2',
      perimeter: 'a + b + c',
    },
  }),
  contentType: 'application/json',
}
```

## 📚 Documentation

- [DyneMCP Documentation](https://dynemcp.dev)
- [Streamable HTTP Transport Guide](https://dynemcp.dev/transport/streamable-http)
- [Mathematical Functions Reference](https://dynemcp.dev/examples/calculator)

## 🤝 Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Mathematical examples and tutorials
- Community: Share mathematical use cases and extensions
