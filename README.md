# DyneMCP

🚀 **Advanced Model Context Protocol (MCP) framework** for building powerful AI server applications.

DyneMCP is a comprehensive framework that provides everything you need to create, build, and deploy MCP servers with ease. It includes a powerful server runtime, CLI tools for project creation, and an advanced build system optimized for MCP applications.

## 🎯 Features

- **🚀 Server Runtime** - High-performance MCP server with advanced features
- **🛠️ Project Generator** - Create new MCP projects with templates
- **⚡ Build System** - Advanced bundling and optimization for MCP servers
- **📦 Component System** - Tools, Resources, and Prompts management
- **🔧 Configuration** - Flexible configuration system
- **📊 Monitoring** - Built-in logging and metrics
- **🛡️ Security** - Security features and validation

## 📦 Packages

### @dynemcp/server-dynemcp
The core MCP server runtime with advanced features.

### @dynemcp/create-dynemcp
CLI tool for creating new MCP projects.

### @dynemcp/build-dynemcp
Advanced build system for MCP projects.

## 🚀 Quick Start

### 1. Create a new MCP project

```bash
npx @dynemcp/create-dynemcp my-mcp-server
cd my-mcp-server
```

### 2. Build and run

```bash
# Build the project
npm run build

# Start the server
npm start

# Development mode
npm run dev
```

## 📋 Project Structure

```
my-mcp-server/
├── src/
│   ├── index.ts              # Server entry point
│   ├── tools/                # MCP Tools
│   ├── resources/            # MCP Resources
│   └── prompts/              # MCP Prompts
├── dynemcp.config.json       # Configuration
├── package.json
└── dist/                     # Build output
```

## ⚙️ Configuration

Configure your MCP server in `dynemcp.config.json`:

```json
{
  "server": {
    "name": "my-mcp-server",
    "version": "1.0.0"
  },
  "tools": {
    "enabled": true,
    "directory": "./src/tools"
  },
  "resources": {
    "enabled": true,
    "directory": "./src/resources"
  },
  "prompts": {
    "enabled": true,
    "directory": "./src/prompts"
  },
  "transport": {
    "type": "stdio"
  },
  "build": {
    "entryPoint": "./src/index.ts",
    "outDir": "./dist",
    "minify": true
  }
}
```

## 🛠️ Development

### Prerequisites

- Node.js 16+
- pnpm (recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/dynemcp.git
cd dynemcp

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## 📚 Documentation

- [Server Documentation](./packages/server-dynemcp/README.md)
- [Create Tool Documentation](./packages/create-dynemcp/README.md)
- [Build System Documentation](./packages/build-dynemcp/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
