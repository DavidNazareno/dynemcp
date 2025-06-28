# DyneMCP Transport Module

This module provides all transport types, schemas, utilities, and defaults required for communication between clients and servers in the DyneMCP framework.

## Purpose

- Centralize all transport logic for the framework
- Provide strong typing and runtime validation for transport configuration
- Enable easy extension and maintenance of transport mechanisms
- Ensure robust error handling and security best practices

## Structure

```
transport/
  core/
    defaults.ts    # Default values for all transport configs
    errors.ts      # Custom error classes for transport errors
    interfaces.ts  # TypeScript interfaces and types for transport
    jsonrpc.ts     # JSON-RPC helpers and type guards
    schemas.ts     # Zod schemas for runtime validation
    stdio.ts       # Stdio transport implementation
    http.ts        # Streamable HTTP transport implementation
  index.ts         # Public API entrypoint for transport
```

## Supported Transports

- **StdioTransport**: Communication over standard input/output streams. Ideal for CLI tools and local integrations.
- **StreamableHTTPTransport**: Communication over HTTP POST and optional SSE streaming. Supports sessions, resumability, and authentication.
- **Custom Transports**: Implement the `Transport` interface to add your own transport mechanisms.

## Key Concepts

- **TypeScript Types**: All transport objects and messages are strongly typed for safety and autocompletion.
- **Zod Schemas**: All transport configuration is validated at runtime using Zod schemas before being used by the framework.
- **Defaults**: All transport configs have centralized defaults, making it easy to extend or override.
- **Error Handling**: Custom error classes provide clear, actionable error messages for transport issues.
- **JSON-RPC**: All message exchange uses JSON-RPC 2.0 as the wire format, with helpers for validation and type guards.

## Usage

### Importing Transports

```ts
import { StdioTransport, StreamableHTTPTransport } from '@/server/transport'
```

### Creating and Using a Transport

```ts
import { loadConfig } from '@/server/config'
import { StreamableHTTPTransport } from '@/server/transport'

const config = await loadConfig()
const transport = new StreamableHTTPTransport(config.transport.options)
await server.connect(transport)
```

### Accessing Types and Schemas

```ts
import type { TransportConfig } from '@/server/transport'
import { TransportConfigSchema } from '@/server/transport'
```

### Error Handling

```ts
import { TransportError } from '@/server/transport'
try {
  await transport.connect(server)
} catch (err) {
  if (err instanceof TransportError) {
    // Handle transport-specific error
  }
}
```

## Best Practices

- **Validate all transport configuration** using the provided schemas before using it in your application.
- **Do not duplicate validation logic** in other parts of the codebase—always use the schemas and config loader.
- **Keep all transport-related logic in this module** for maintainability and clarity.
- **Extend types and schemas here** if you add new transport options to the framework.
- **Follow security best practices** (CORS, authentication, session management, etc.) as described in the MCP documentation.

## Extending Transports

1. Add new transport types to `interfaces.ts` and `schemas.ts`.
2. Add defaults in `defaults.ts`.
3. Implement the new transport in a separate file (e.g., `myCustomTransport.ts`).
4. Update the public API in `index.ts`.
5. Add tests for new transport types.

## Maintainers

- Keep this module in sync with the rest of the framework and the MCP SDK.
- Review changes for backwards compatibility and clarity.
- Document any new transport types or breaking changes.

---

For more information, see the main DyneMCP documentation or contact the maintainers.
