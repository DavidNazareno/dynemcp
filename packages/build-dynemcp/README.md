# @dynemcp/build-dynemcp

🚀 **Advanced build system for DyneMCP projects** with optimizations specifically designed for Model Context Protocol (MCP) servers.

## Features

- ⚡ **Fast builds** using esbuild
- 📦 **Smart bundling** with tree-shaking and minification
- 🔧 **MCP-specific optimizations** for server environments
- 📊 **Dependency analysis** and reporting
- 👀 **Watch mode** for development
- 📋 **Build manifests** and HTML reports
- 🧹 **Clean builds** with cache management
- 🎯 **CLI tool generation** support

## Installation

```bash
npm install @dynemcp/build-dynemcp
# or
pnpm add @dynemcp/build-dynemcp
# or
yarn add @dynemcp/build-dynemcp
```

## Quick Start

### CLI Usage

```bash
# Build your project
dynebuild

# Build with analysis
dynebuild --analyze

# Build in watch mode
dynebuild watch

# Clean build directory
dynebuild clean

# Analyze dependencies
dynebuild analyze
```

### Programmatic Usage

```typescript
import { build, watch, analyze } from '@dynemcp/build-dynemcp';

// Build with options
const result = await build({
  configPath: './dynemcp.config.json',
  clean: true,
  analyze: true,
  manifest: true,
  html: true,
});

// Watch mode
const ctx = await watch({
  configPath: './dynemcp.config.json',
});

// Analyze dependencies
const analysis = await analyze({
  configPath: './dynemcp.config.json',
});
```

## Configuration

The build system reads configuration from your `dynemcp.config.json` file:

```json
{
  "server": {
    "name": "my-mcp-server",
    "version": "1.0.0"
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

### Build Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entryPoint` | string | `"./src/index.ts"` | Entry point file |
| `outDir` | string | `"./dist"` | Output directory |
| `outFile` | string | `"server.js"` | Output filename |
| `format` | `"esm" \| "cjs"` | `"esm"` | Output format |
| `minify` | boolean | `true` | Enable minification |
| `sourcemap` | boolean | `false` | Generate source maps |
| `bundle` | boolean | `true` | Bundle all dependencies |
| `external` | string[] | `[]` | External dependencies |
| `define` | object | `{}` | Global definitions |
| `platform` | `"node" \| "browser"` | `"node"` | Target platform |
| `target` | string | `"node16"` | Node.js target version |
| `treeShaking` | boolean | `true` | Enable tree shaking |
| `splitting` | boolean | `false` | Enable code splitting |
| `metafile` | boolean | `false` | Generate metafile |
| `watch` | boolean | `false` | Enable watch mode |

## CLI Commands

### `dynebuild build` (default)

Build your DyneMCP project:

```bash
# Basic build
dynebuild

# Build with options
dynebuild --clean --analyze --html

# Build with custom config
dynebuild --config ./custom.config.json
```

### `dynebuild watch`

Build in watch mode for development:

```bash
dynebuild watch
```

### `dynebuild cli`

Build a CLI tool:

```bash
dynebuild cli
```

### `dynebuild clean`

Clean the build directory:

```bash
dynebuild clean
```

### `dynebuild analyze`

Analyze project dependencies:

```bash
dynebuild analyze
```

## CLI Options

| Option | Description |
|--------|-------------|
| `-c, --config <path>` | Path to config file |
| `--clean` | Clean before building |
| `--analyze` | Analyze dependencies |
| `--manifest` | Generate build manifest |
| `--html` | Generate HTML report |
| `--watch` | Enable watch mode |
| `--cli` | Build as CLI tool |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "dynebuild",
    "build:watch": "dynebuild watch",
    "build:analyze": "dynebuild --analyze",
    "build:clean": "dynebuild --clean",
    "build:html": "dynebuild --html",
    "clean": "dynebuild clean",
    "analyze": "dynebuild analyze",
    "start": "node dist/server.js"
  }
}
```

## Build Outputs

The build system generates several outputs:

- **`dist/server.js`** - Main bundled server file
- **`dist/build-manifest.json`** - Build manifest (if enabled)
- **`dist/build-report.html`** - HTML build report (if enabled)
- **`dist/dependency-analysis.txt`** - Dependency analysis (if enabled)

## MCP-Specific Optimizations

The build system includes several optimizations specifically for MCP servers:

- **Import optimization** - Removes unused MCP SDK imports
- **Debug removal** - Strips debug code in production
- **Console optimization** - Removes console statements in production
- **Bundle optimization** - Optimizes for server environment

## Examples

### Basic MCP Server Build

```typescript
// src/index.ts
import { createMCPServer } from '@dynemcp/server-dynemcp';

const server = createMCPServer();

async function main() {
  await server.start();
}

main().catch(console.error);
```

### Custom Build Configuration

```json
{
  "build": {
    "entryPoint": "./src/index.ts",
    "outDir": "./build",
    "outFile": "mcp-server.js",
    "minify": true,
    "sourcemap": true,
    "external": ["@modelcontextprotocol/sdk"],
    "define": {
      "process.env.NODE_ENV": "production"
    }
  }
}
```

### Advanced Build with Analysis

```bash
# Build with full analysis and reporting
dynebuild --clean --analyze --manifest --html
```

This will:
1. Clean the build directory
2. Build the project
3. Analyze dependencies
4. Generate build manifest
5. Create HTML report

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
