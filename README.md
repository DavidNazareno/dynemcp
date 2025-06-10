# DyneMCP Framework

A scalable TypeScript framework for building Model Context Protocol (MCP) servers using the official MCP TypeScript SDK.

This project is organized as a monorepo using Turborepo and pnpm workspaces for efficient development and package management.

## Features

- Built on top of the official MCP TypeScript SDK
- Easy creation and organization of MCP servers
- Standardized way to expose tools, resources, and prompts
- CLI tools for development, live testing, and deployment
- Production-optimized MCP servers
- Built-in environment variable support
- Hot reloading during development
- Type-safe development with Zod schema validation

## Installation

```bash
# Using npm
npm create dynemcp@latest

# Using pnpm
pnpm create dynemcp@latest
```

This command starts an interactive generator that guides you through creating an MCP server from a functional template or from scratch.

## Building Your MCP Server

DyneMCP uses the `dynebuild` package to create a unified, minified bundle for production deployment. When you create a new project with `pnpm create dynemcp@latest`, a build script is automatically set up for you.

```bash
# Build your MCP server
pnpm run build
```

This will create a single optimized file at `dist/server.js` that contains all your code and dependencies, ready for deployment.

## Project Structure

### Monorepo Structure

This project is organized as a monorepo with the following structure:

```
monorepo-root/
│
├── packages/                 → Core packages
│   ├── dynemcp/              → Main DyneMCP framework
│   ├── dynemcp-types/        → TypeScript types
│   ├── dynemcp-tools/        → Common tools
│   ├── dynebuild/            → Build utilities
│   └── create-dynemcp/       → Project scaffolding CLI
│
├── configs/                  → Shared configurations
│   ├── eslint/               → ESLint configuration
│   ├── typescript/           → TypeScript configuration
│   └── prettier/             → Prettier configuration
│
├── examples/                 → Example projects
│   ├── basic-server/         → Simple MCP server with standard structure
│   └── custom-tools/         → Server with custom tools implementation
│
├── turbo.json                → Turborepo configuration
├── pnpm-workspace.yaml       → pnpm workspace configuration
└── package.json              → Root package.json
```

### Individual Project Structure

When using DyneMCP to create a new MCP server, the framework uses a convention-based structure:

```
project-root/
│
├── tools/            → MCP tools (functions executable by AI)
│   └── tools.ts      → Central file registering tools
│
├── resources/        → Static or dynamic resources
│   └── resource.ts   → Central file registering resources
│
├── prompt/           → Base or transformable prompts
│   └── prompt.ts     → Central registry of prompts
│
├── dynemcp.config.json → MCP server configuration
└── ...
```

## Building DyneMCP Servers

DyneMCP includes a build script that generates a production-ready MCP server from your project structure. When you run the build script, it:

1. Compiles your TypeScript code
2. Collects all tools, resources, and prompts from their respective directories
3. Bundles them into a single optimized file using the `dynebuild` package
4. Creates a server that uses `dynemcp server` to run your MCP server

### Configuration

The build process is configured through the `dynemcp.config.json` file:

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Your project description",
  "server": {
    "name": "your-server-name",
    "version": "1.0.0"
  },
  "build": {
    "outDir": "./dist",
    "minify": true,
    "sourceMaps": false
  }
}
```

### Usage

To build your MCP server:

### Building for Production

To build a production-ready MCP server, run:

```bash
pnpm run build
```

This will:

1. Compile TypeScript code to JavaScript
2. Bundle the server into a single file using the `dynebuild` package

The resulting output will be a minified, optimized file in the `dist/server.js` that you can deploy to any Node.js environment.

### How the Build Process Works

Each example includes a custom build script (`scripts/build.js`) that:

1. Reads the `dynemcp.config.json` configuration
2. Detects the entry point (`src/index.ts` or `src/index.js`)
3. Uses the `dynebuild` package to create a unified, minified bundle

The `dynebuild` package is included as a workspace dependency in each example, ensuring that the build process works correctly without external dependencies.

### Building All Examples

To build all examples in the monorepo:

```bash
# From the root directory
pnpm run build:examples
```

## Environment Variables

DyneMCP supports environment variables natively, similar to Next.js:

```typescript
import { env } from "dynemcp/env";

const token = env("OPENAI_API_KEY");
```

It automatically loads these files:

- `.env`
- `.env.local`
- `.env.production` (depending on execution mode)

## Development Mode

For interactive development:

```bash
npx @modelcontextprotocol/inspector dev
```

This launches a live mode that simulates how an AI model would consume the MCP server, facilitating debugging and testing of tools, resources, and prompts in real-time.

## Optimized Build

The framework includes a production-ready build system:

```bash
pnpm build
```

This creates:

- A single minified file for all tools
- A single file for resources
- A single file for prompts
- A final server file including the entire runtime

The output is ready for deployment on traditional servers, serverless platforms, or edge functions.

## Configuration

The `dynemcp.config.json` file defines server parameters:

```json
{
  "envPrefix": "MCP_",
  "optimize": true,
  "outputMode": "server",
  "port": 8080,
  "promptStyle": "chatml",
  "exposeMetadata": true
}
```

Valid options for `outputMode` include: `server`, `edge`, or `local`.
Valid options for `promptStyle` include: `chatml`, `plain`, or `custom`.

## Example Usage

### Defining a Tool

```typescript
import { z } from "zod";
import { createTool } from "dynemcp/tools";

export const calculatorTool = createTool(
  "calculator",
  "Performs basic arithmetic operations",
  z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide"]),
    a: z.number(),
    b: z.number(),
  }),
  async (params) => {
    switch (params.operation) {
      case "add":
        return { result: params.a + params.b };
      case "subtract":
        return { result: params.a - params.b };
      case "multiply":
        return { result: params.a * params.b };
      case "divide":
        if (params.b === 0) throw new Error("Division by zero");
        return { result: params.a / params.b };
    }
  },
);

// Export all tools
export default [calculatorTool];
```

### Defining a Resource

```typescript
import { createDynamicResource } from "dynemcp/resources";

export const timeResource = createDynamicResource(
  "current-time",
  "Current Time",
  () => {
    const now = new Date();
    return JSON.stringify({
      time: now.toISOString(),
      timestamp: now.getTime(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  },
  {
    description: "Returns the current server time",
    contentType: "application/json",
  },
);

// Export all resources
export default [timeResource];
```

### Defining a Prompt

```typescript
import { createSystemPrompt } from "dynemcp/prompt";

export const assistantPrompt = createSystemPrompt(
  "assistant",
  "Assistant Prompt",
  "You are a helpful AI assistant. Answer questions accurately and concisely.",
  {
    description: "Basic assistant system prompt",
  },
);

// Export all prompts
export default [assistantPrompt];
```

## Development Workflow

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/dynemcp-core.git
cd dynemcp-core

# Install dependencies
pnpm install
```

### Common Commands

```bash
# Build all packages
pnpm run build

# Run development mode with watch
pnpm run dev

# Run tests
pnpm run test

# Run linting
pnpm run lint

# Format code
pnpm run format

# Clean build artifacts
pnpm run clean
```

### Using Turborepo

This project uses Turborepo to manage the build system. The pipeline is defined in `turbo.json` and includes tasks for building, testing, linting, and more.

## Contributing

We welcome contributions to DyneMCP! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Run linting: `pnpm lint`
6. Format code: `pnpm format`
7. Commit your changes: `git commit -m 'Add my feature'`
8. Push to the branch: `git push origin feature/my-feature`
9. Submit a pull request

## SDK Integration

DyneMCP has been fully refactored to use the official MCP TypeScript SDK. This integration brings several benefits:

- **Standardized Implementation**: Uses the official SDK interfaces and types
- **Future-proof**: Automatically benefits from updates to the official SDK
- **Simplified Architecture**: Removes custom server implementations in favor of the official SDK
- **Better Type Safety**: Leverages TypeScript and Zod for complete type safety

### Migration from Legacy Implementation

If you're upgrading from a previous version of DyneMCP that used the custom server implementation, here are the key changes:

1. The `MCPServer` class from `core/server.ts` has been replaced with `DyneMCP` from `core/dynemcp.ts`
2. Tools, resources, and prompts now use adapters to ensure compatibility with the SDK
3. Event handlers are now managed by the SDK instead of custom event emitters

### Example of Using the SDK

```typescript
import { createMCPServer } from "dynemcp";
import { z } from "zod";

// Create a server
const server = createMCPServer("my-server", "1.0.0");

// Register a tool
server.registerTool({
  name: "hello",
  description: "Says hello to someone",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
    },
    required: ["name"],
  },
  handler: async ({ name }) => {
    return { message: `Hello, ${name}!` };
  },
});

// Start the server
server.start();
```

## License

ISC
