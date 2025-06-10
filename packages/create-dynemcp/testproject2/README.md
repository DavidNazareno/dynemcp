# DyneMCP Project

A Model Context Protocol (MCP) server built with DyneMCP.

## Project Structure

```
dynemcp-project/
│
├── tools/            → MCP tools (functions executable by AI)
│   └── tools.ts      → Central file registering tools
│
├── scripts/          → Build and utility scripts
│   └── build.js      → Script to build the MCP server using dynebuild
│
├── resources/        → Static or dynamic resources
│   └── resource.ts   → Central file registering resources
│
├── prompt/           → Base or transformable prompts
│   └── prompt.ts     → Central registry of prompts
│
├── src/              → Source code
│   └── index.ts      → Entry point
│
└── dynemcp.config.json → MCP server configuration
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

## Building for Production

This project uses `dynebuild` to create a unified, minified bundle for production deployment:

```bash
pnpm run build
```

This command will:

1. Create a single optimized file at `dist/server.js`
2. Include all your code and dependencies in one bundle
3. Minify the output for better performance

After building, you can run your MCP server with:

```bash
pnpm start
# or
node dist/server.js
```

## Adding Tools, Resources, and Prompts

- Add tools in `tools/tools.ts`
- Add resources in `resources/resource.ts`
- Add prompts in `prompt/prompt.ts`

For more information, refer to the DyneMCP documentation.
