# Default DyneMCP Template

A minimal MCP (Model Context Protocol) server template that provides basic examples of tools, resources, and prompts. Perfect for learning MCP concepts and starting new projects.

## 🚀 What's Included

This template provides a basic foundation for MCP development with:

- **Basic Tool**: Simple text manipulation tool for demonstrations
- **Sample Resource**: Static content resource example
- **Simple Prompt**: AI assistance prompt template
- **Standard Configuration**: Ready-to-use `dynemcp.config.json`
- **TypeScript Setup**: Modern TS configuration with type safety
- **Build Scripts**: Development and production build commands

## 📁 Project Structure

```
your-project/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/                # MCP tools directory
│   │   └── tools.ts          # Basic tool examples
│   ├── resources/            # MCP resources directory
│   │   └── resource.ts       # Static resource example
│   └── prompts/              # MCP prompts directory (optional)
│       └── prompt.ts         # Basic prompt template
├── dynemcp.config.json       # DyneMCP configuration
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

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Test the server**:
   ```bash
   # In another terminal, test with MCP client
   # The server will be available via stdio transport
   ```

## 🛠️ Included Components

### Tools (`src/tools/tools.ts`)

The template includes a basic text manipulation tool:

```typescript
import { ToolDefinition } from '@dynemcp/dynemcp'
import { z } from 'zod'

const echoTool: ToolDefinition = {
  name: 'echo',
  description: 'Echo back the input text',
  schema: z.object({
    text: z.string().describe('Text to echo back'),
  }),
  handler: async ({ text }) => {
    return { result: `Echo: ${text}` }
  },
}
```

**Use cases**:

- Learning tool implementation patterns
- Testing MCP client connections
- Template for custom tools

### Resources (`src/resources/resource.ts`)

A simple static resource example:

```typescript
import { ResourceDefinition } from '@dynemcp/dynemcp'

const welcomeResource: ResourceDefinition = {
  uri: 'welcome://info',
  name: 'Welcome Information',
  description: 'Basic welcome information for new users',
  content: 'Welcome to your new DyneMCP server!',
  contentType: 'text/plain',
}
```

**Use cases**:

- Providing static documentation
- Configuration information
- Help text and guides

### Prompts (`src/prompts/prompt.ts`)

Basic AI assistance prompt:

```typescript
import { PromptDefinition } from '@dynemcp/dynemcp'

const assistantPrompt: PromptDefinition = {
  id: 'assistant',
  name: 'AI Assistant',
  description: 'General purpose AI assistant prompt',
  content: `You are a helpful AI assistant. Please provide clear, 
accurate, and helpful responses to user questions.`,
}
```

**Use cases**:

- General AI assistance
- Template for specialized prompts
- Learning prompt structure

## ⚙️ Configuration

The `dynemcp.config.json` file is configured for basic usage:

```json
{
  "server": {
    "name": "dynemcp-project",
    "version": "1.0.0"
  },
  "transport": {
    "type": "stdio"
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
  }
}
```

### Key Features:

- **stdio transport**: Standard input/output communication
- **Auto-loading**: Automatically discovers components
- **TypeScript support**: Works with .ts and .js files
- **Flexible patterns**: Use glob patterns for file discovery

## 🎯 Development Commands

```bash
# Start development server with hot reload
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

## 🔧 Customization

### Adding New Tools

Create new files in `src/tools/`:

```typescript
// src/tools/my-tool.ts
import { ToolDefinition } from '@dynemcp/dynemcp'
import { z } from 'zod'

const myTool: ToolDefinition = {
  name: 'my-tool',
  description: 'Description of what this tool does',
  schema: z.object({
    // Define your input schema here
    input: z.string().describe('Input parameter'),
  }),
  handler: async ({ input }) => {
    // Implement your tool logic here
    return { result: `Processed: ${input}` }
  },
}

export default myTool
```

### Adding New Resources

Create new files in `src/resources/`:

```typescript
// src/resources/my-resource.ts
import { ResourceDefinition } from '@dynemcp/dynemcp'

const myResource: ResourceDefinition = {
  uri: 'my://resource',
  name: 'My Resource',
  description: 'Description of this resource',
  content: 'Resource content here',
  contentType: 'text/plain',
}

export default myResource
```

### Adding New Prompts

Create new files in `src/prompts/`:

```typescript
// src/prompts/my-prompt.ts
import { PromptDefinition } from '@dynemcp/dynemcp'

const myPrompt: PromptDefinition = {
  id: 'my-prompt',
  name: 'My Prompt',
  description: 'Description of this prompt',
  content: 'Your prompt content here',
}

export default myPrompt
```

## 🌐 Transport Options

While this template uses stdio transport by default, you can easily switch to other transports:

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
      "endpoint": "/sse"
    }
  }
}
```

## 🧪 Testing

### Basic Testing

```bash
# Run the server in one terminal
npm run dev

# Test with a simple MCP client in another terminal
# (Implementation depends on your MCP client setup)
```

### Manual Testing

You can test individual components:

```typescript
// Test a tool manually
import { echoTool } from './src/tools/tools'

const result = await echoTool.handler({ text: 'Hello World' })
console.log(result) // { result: 'Echo: Hello World' }
```

## 📚 Learning Resources

This template is perfect for:

- **MCP Beginners**: Learn basic concepts with working examples
- **Prototyping**: Quick start for new MCP projects
- **Education**: Teaching MCP development patterns
- **Reference**: Template for best practices

### Next Steps

1. **Explore the code**: Understand how tools, resources, and prompts work
2. **Modify examples**: Change the echo tool to do something useful
3. **Add complexity**: Implement more sophisticated tools
4. **Try other transports**: Experiment with HTTP or SSE
5. **Read documentation**: Learn more about DyneMCP features

## 🔗 Related Templates

- **Calculator**: For mathematical operations and scientific computing
- **HTTP Server**: For web integration and REST APIs
- **Secure Agent**: For production environments with authentication
- **Dynamic Agent**: For advanced AI research and adaptive systems

## 🤝 Contributing

Found ways to improve this template? We welcome contributions!

1. Fork the repository
2. Make your improvements
3. Test thoroughly
4. Submit a pull request

## 📄 License

This template is part of the DyneMCP project and is licensed under the MIT License.

## 🔗 Links

- [DyneMCP Framework](https://github.com/dynemcp/dynemcp)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Create DyneMCP CLI](https://www.npmjs.com/package/@dynemcp/create-dynemcp)
- [Documentation](https://dynemcp.dev)
