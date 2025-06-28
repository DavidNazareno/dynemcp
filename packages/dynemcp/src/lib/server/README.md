# DyneMCP Server Module

The `server` module is the core of the DyneMCP framework, providing all the building blocks to create, configure, and extend a fully MCP-compliant server. It is designed for modularity, extensibility, and best practices, enabling both rapid prototyping and robust production deployments.

## Architecture Overview

The server module is composed of several focused submodules:

- **main/**: Entry point for server initialization, lifecycle management, and integration with the MCP SDK. Handles loading and registration of all components.
- **api/**: Defines the core types and interfaces for tools, resources, prompts, and their contracts with the MCP protocol.
- **registry/**: Manages dynamic discovery, loading, and registration of all server components (tools, resources, prompts) using a unified registry pattern.
- **config/**: Provides configuration schemas, validation, and utilities for loading and managing server configuration from files or environment variables.
- **communication/**: Implements all supported MCP transports (stdio, streamable HTTP, etc.) in a modular, extensible way, following the MCP SDK.
- **components/**: Offers helpers for dynamic loading and declarative creation of tools, resources, and prompts, supporting plug-and-play extensibility.

## Key Features

- **MCP-compliant**: Strictly follows the Model Context Protocol specification and SDK.
- **Modular**: Each concern (config, transport, registry, etc.) is isolated and extensible.
- **Plug-and-play**: Easily add new tools, resources, or prompts by dropping files or using factory helpers.
- **Type-safe**: All APIs are strongly typed and validated.
- **Production-ready**: Designed for both rapid development and robust, scalable deployments.

## High-Level Usage Example

```ts
import { createMCPServer } from '@dynemcp/dynemcp/server/main'

const server = await createMCPServer('dynemcp.config.json')
await server.start()
```

## Submodules

- See each submodule's README for detailed usage and API:
  - [`main/`](./main/README.md)
  - [`api/`](./api/README.md)
  - [`registry/`](./registry/README.md)
  - [`config/`](./config/README.md)
  - [`communication/`](./communication/README.md)
  - [`components/`](./components/README.md)

## Best Practices

- Organize your tools, resources, and prompts in clear directories.
- Use the provided loaders and factory helpers for maximum extensibility.
- Validate your configuration and schemas for robust, predictable behavior.
- Follow the MCP SDK and protocol for compatibility and security.

## License

MIT
