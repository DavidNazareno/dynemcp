# DyneMCP Main Server Module

This module provides the main entry point and core utilities for running a DyneMCP server, following the Model Context Protocol (MCP) SDK. It exposes a robust, type-safe, and extensible API for initializing, configuring, and running MCP-compliant servers.

## Features

- **Main server class (`DyneMCP`)**: High-level abstraction for server lifecycle and configuration.
- **Async factory (`createMCPServer`)**: Flexible creation of server instances from config files or objects.
- **Component registration utilities**: Register tools, resources, and prompts with strict type safety and SDK compliance.
- **Custom error classes**: For robust error handling during server initialization.
- **Utility functions**: For logging and debugging.

## Public API

```ts
import {
  DyneMCP,
  createMCPServer,
  createMCPServerInstance,
  registerTools,
  registerResources,
  registerPrompts,
  registerComponents,
  ServerInitializationError,
  logMsg,
  type ServerInitializationOptions,
} from '@dynemcp/dynemcp/server/main'
```

### Main Server Usage

#### Async Factory (Recommended)

```ts
import { createMCPServer } from '@dynemcp/dynemcp/server/main'

const server = await createMCPServer('dynemcp.config.json')
await server.start()
```

#### Direct Class Usage

```ts
import { DyneMCP } from '@dynemcp/dynemcp/server/main'

const server = await DyneMCP.create({
  server: { name: 'MyServer', version: '1.0.0' },
  // ...other config
})
await server.start()
```

### Registering Components

You can register tools, resources, and prompts using the provided utilities:

```ts
import { registerComponents } from '@dynemcp/dynemcp/server/main'

registerComponents(serverInstance, tools, resources, prompts)
```

## Extensibility & Best Practices

- All handlers and registration utilities are strictly typed and validated against the MCP SDK.
- The module is designed for modularity: you can extend or replace any part (tools, transports, etc.) as needed.
- Error handling is robust and explicit, with custom error classes for initialization failures.

## Directory Structure

- `core/server.ts` — Main server class and async factory
- `core/initializer.ts` — Registration and initialization helpers
- `core/interfaces.ts` — Public types and interfaces
- `core/errors.ts` — Custom error classes
- `core/utils.ts` — Logging and utility functions

## License

MIT
