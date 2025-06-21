# @dynemcp/dynemcp

🚀 **Complete MCP Framework** - Unified framework for building Model Context Protocol (MCP) servers with advanced build system and runtime.

## Features

- ⚡ **Fast Development** - Hot reload and watch mode
- 🔨 **Advanced Build System** - Optimized bundling with esbuild
- 🚀 **Production Ready** - Optimized for production deployment
- 📦 **Component System** - Tools, Resources, and Prompts management
- 🔧 **Flexible Configuration** - Easy configuration via `dynemcp.config.json`
- 📊 **Analytics** - Built-in dependency analysis and reporting

## Quick Start

### Installation

```bash
npm install @dynemcp/dynemcp
```

### Basic Usage

```bash
# Development
dynemcp dev

# Build for production
dynemcp build

# Start production server
dynemcp start

# Analyze dependencies
dynemcp analyze

# Clean build directory
dynemcp clean
```

## Commands

### `dynemcp dev`

Start development server with hot reload:

```bash
dynemcp dev
dynemcp dev --port 3001
dynemcp dev --watch
```

### `dynemcp build`

Build the project for production:

```bash
dynemcp build
dynemcp build --clean
dynemcp build --analyze
dynemcp build --html
```

### `dynemcp start`

Start production server:

```bash
dynemcp start
dynemcp start --port 8080
```

### `dynemcp analyze`

Analyze project dependencies:

```bash
dynemcp analyze
```

### `dynemcp clean`

Clean build directory:

```bash
dynemcp clean
```

## Configuration

Create a `dynemcp.config.json` file in your project root:

```json
{
  "server": {
    "name": "my-mcp-server",
    "version": "1.0.0"
  },
  "description": "A Model Context Protocol (MCP) server",
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
  "build": {
    "entryPoint": "./src/index.ts",
    "outDir": "./dist",
    "outFile": "server.js",
    "format": "esm",
    "minify": true,
    "sourcemap": false,
    "bundle": true,
    "external": [],
    "define": {},
    "platform": "node",
    "target": "node16",
    "treeShaking": true,
    "splitting": false,
    "metafile": false,
    "watch": false
  }
}
```

## Project Structure

```
my-mcp-project/
├── src/
│   ├── index.ts              # Server entry point
│   ├── tools/                # MCP Tools
│   ├── resources/            # MCP Resources
│   └── prompts/              # MCP Prompts
├── dynemcp.config.json       # Configuration
├── package.json
└── dist/                     # Build output
```

## Defining Components

The core of a DyneMCP server is its components: Tools, Resources, and Prompts. The framework provides two flexible ways to define them, catering to different programming styles. The component loader will automatically detect the format you use.

### 1. Declarative Method (Plain Objects)

This is the most straightforward approach. You define a component as a plain JavaScript/TypeScript object that conforms to its corresponding `Definition` interface (`ToolDefinition`, `ResourceDefinition`, `PromptDefinition`).

**Example: `src/tools/greeter.ts`**
```typescript
import { z } from 'zod'
import { ToolDefinition } from '@dynemcp/dynemcp'

const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

const greeterTool: ToolDefinition = {
  name: 'greeter',
  description: 'A simple tool that greets the user',
  schema: GreeterSchema,
  handler: async ({ name }: z.infer<typeof GreeterSchema>) => {
    return { message: `Hello, ${name}!` }
  },
}

export default greeterTool
```

### 2. Class-based Method (OOP)

For those who prefer an Object-Oriented approach, you can extend the base classes provided by the framework (`DyneMCPTool`, `DyneMCPResource`, `DyneMCPPrompt`). This provides a clear structure and can encapsulate more complex logic cleanly.

**Example: `src/tools/greeter.ts`**
```typescript
import { z } from 'zod'
import { DyneMCPTool } from '@dynemcp/dynemcp'

const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

export class GreeterTool extends DyneMCPTool {
  // Note: 'name' is a getter to override the base class accessor
  get name() {
    return 'greeter'
  }
  
  readonly description = 'A simple tool that greets the user'
  readonly schema = GreeterSchema

  async execute(
    input: z.infer<typeof GreeterSchema>
  ): Promise<{ message: string }> {
    return { message: `Hello, ${input.name}!` }
  }
}

export default new GreeterTool()
```

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "dynemcp dev",
    "build": "dynemcp build",
    "start": "dynemcp start",
    "clean": "dynemcp clean",
    "analyze": "dynemcp analyze"
  },
  "dependencies": {
    "@dynemcp/dynemcp": "^1.0.0"
  }
}
```

## Programmatic Usage

```typescript
import { createServer, build, dev, start } from '@dynemcp/dynemcp';

// Create server
const server = createServer();

// Build project
await build({ clean: true, analyze: true });

// Start development
await dev({ watch: true });

// Start production
await start({ port: 3000 });
```

## API Reference

### Server API

```typescript
import { createServer, createMCPServer } from '@dynemcp/dynemcp';

// Create server instance
const server = createServer();

// Start server
await server.start();

// Stop server
await server.stop();
```

### Build API

```typescript
import { build, watch, analyze, clean } from '@dynemcp/dynemcp';

// Build project
const result = await build({
  clean: true,
  analyze: true,
  manifest: true,
  html: true,
});

// Watch mode
const ctx = await watch();

// Analyze dependencies
const analysis = await analyze();

// Clean build
await clean();
```

## Examples

### Basic MCP Server

```typescript
// src/index.ts
import { createServer } from '@dynemcp/dynemcp';

const server = createServer();

async function main() {
  try {
    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
```

### Custom Tools

```typescript
// src/tools/calculator.ts
import { Tool } from '@modelcontextprotocol/sdk';

export const calculatorTool: Tool = {
  name: 'calculator',
  description: 'Perform mathematical calculations',
  inputSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate',
      },
    },
    required: ['expression'],
  },
  handler: async (args) => {
    const { expression } = args;
    const result = eval(expression);
    return { result };
  },
};
```

## Development

### Local Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm dev
```

### Testing

```bash
# Run tests
pnpm test

# Watch tests
pnpm test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
