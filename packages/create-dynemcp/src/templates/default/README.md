# Default DyneMCP Template

A minimal MCP (Model Context Protocol) server template using **stdio transport** - perfect for learning MCP concepts and command-line integrations.

## 🚀 What's Included

This template provides a basic foundation for MCP development with:

- **Basic Tool**: Simple text manipulation tool for demonstrations
- **Sample Resource**: Static content resource example
- **Simple Prompt**: AI assistance prompt template
- **Stdio Transport**: Command-line interface for MCP communication
- **Standard Configuration**: Ready-to-use `dynemcp.config.json`
- **TypeScript Setup**: Modern TS configuration with type safety
- **Build Scripts**: Development and production build commands

## 🔌 Transport: Standard Input/Output (stdio)

This template uses **stdio transport** which is ideal for:

- **Command-line tools**: Direct integration with shells and scripts
- **Local development**: Simple testing and debugging
- **IDE integrations**: Language servers and development tools
- **Process communication**: Parent-child process interactions

### How it works:

- Communication via stdin/stdout
- JSON-RPC messages over standard streams
- No network configuration required
- Perfect for local tools and utilities

## 📁 Project Structure

```
your-project/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/                # MCP tools directory
│   │   └── tools.ts          # Basic tool examples
│   ├── resources/            # MCP resources directory
│   │   └── resource.ts       # Static resource example
│   └── prompts/              # MCP prompts directory
│       └── prompt.ts         # Basic prompt template
├── dynemcp.config.json       # DyneMCP configuration (stdio)
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🔧 Quick Start

1. **Navigate to your project directory**:

   ```bash
   cd your-project
   ```

2. **Install dependencies** (if not already done):

   ```bash
   npm install
   ```

3. **Build the project**:

   ```bash
   npm run build
   ```

4. **Test with MCP Inspector** (if available):

   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

5. **Or run directly for stdio communication**:
   ```bash
   node dist/index.js
   ```

## 🛠️ Stdio Transport Configuration

The `dynemcp.config.json` uses stdio transport:

```json
{
  "transport": {
    "type": "stdio"
  }
}
```

### Transport Features:

- ✅ **Simple setup**: No ports or network configuration
- ✅ **Low latency**: Direct process communication
- ✅ **Security**: No network exposure
- ✅ **Debugging**: Easy to trace with standard tools
- ❌ **Network access**: Cannot be accessed remotely
- ❌ **Web integration**: Not suitable for web applications

## 🎯 Use Cases

Perfect for:

- Learning MCP basics
- Command-line utilities
- Local development tools
- IDE extensions
- Build system integrations
- Testing and prototyping

## 🔧 Development Commands

```bash
# Start development with watch mode
npm run dev

# Build for production
npm run build

# Start built server
npm start

# Type checking
npm run typecheck

# Lint code
npm run lint
```

## 🚀 Next Steps

Once comfortable with stdio transport, consider exploring:

- **calculator template**: Streamable HTTP transport basics
- **dynamic-agent template**: Session management
- **http-server template**: Full HTTP features
- **secure-agent template**: Authentication & security

## 🔧 Customization

### Adding New Tools

Create new files in `src/tools/`:

```typescript
// src/tools/my-tool.ts
import { ToolDefinition } from '@dynemcp/dynemcp'
import { z } from 'zod'

export const myTool: ToolDefinition = {
  name: 'my-tool',
  description: 'My custom tool',
  schema: z.object({
    input: z.string().describe('Tool input'),
  }),
  handler: async ({ input }) => {
    // Your tool logic here
    return { result: `Processed: ${input}` }
  },
}
```

### Adding Resources

Create new files in `src/resources/`:

```typescript
// src/resources/my-resource.ts
import { ResourceDefinition } from '@dynemcp/dynemcp'

export const myResource: ResourceDefinition = {
  uri: 'my://resource',
  name: 'My Resource',
  description: 'Custom resource',
  content: 'Resource content here',
  contentType: 'text/plain',
}
```

## 📚 Documentation

- [DyneMCP Documentation](https://dynemcp.dev)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [TypeScript Guide](https://www.typescriptlang.org/docs/)

## 🤝 Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Comprehensive guides and examples
- Community: Join our Discord for help and discussions
