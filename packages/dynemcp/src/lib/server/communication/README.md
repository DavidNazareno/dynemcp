# DyneMCP Communication Module

This module centralizes all communication logic and protocols for DyneMCP, strictly following the MCP SDK and professional architecture best practices.

## Directory Structure

```
communication/
  core/
    interfaces.ts      # Base contracts: Transport, JSONRPCMessage, etc.
    errors.ts          # Custom error classes for transports
    defaults.ts        # Default values for transports
    schemas.ts         # Zod schemas for transport config validation
    factory.ts         # Transport factory and public entrypoint
    jsonrpc.ts         # Type guards and validation for JSON-RPC
  http/
    server.ts          # Streamable HTTP server implementation
    client.ts          # (future) HTTP client
    sse-legacy.ts      # (optional) SSE legacy
  stdio/
    server.ts          # STDIO server
    client.ts          # (future) STDIO client
  utils.ts             # Common utilities (future)
  index.ts             # Centralized exports
```

---

## Main Files (core/)

- **interfaces.ts**: Contracts for Transport, JSON-RPC messages, and transport configs.
- **errors.ts**: Custom error classes for transport-related errors.
- **defaults.ts**: Default values and supported types for transports.
- **schemas.ts**: Zod schemas for validating transport config options.
- **factory.ts**: Public entrypoint, re-exports, and transport factory function.
- **jsonrpc.ts**: Type guards and validation utilities for JSON-RPC messages.

---

## Philosophy

- **SDK Fidelity:** All implementations follow the MCP SDK contract and formats.
- **Modularity:** Each protocol and utility is in its own file/folder.
- **Extensibility:** Easy to add new protocols (WebSocket, gRPC, etc.) in the future.
- **Security:** Includes SDK security recommendations (origin validation, TLS, etc.).
- **Strong Typing:** TypeScript and Zod for robustness and maintainability.

---

## Current Implementations

- **STDIO:** Communication via standard streams (ideal for CLI and local processes).
- **Streamable HTTP:** HTTP communication with support for SSE and sessions.
- **SSE Legacy:** (optional) For backward compatibility.

---

## Extending

You can add new transports by implementing the `Transport` interface and registering them in the factory.

---

## Usage Example

```typescript
import { createTransport, TRANSPORT_TYPES } from './communication/core/factory'

const transport = createTransport({
  type: TRANSPORT_TYPES[1], // 'streamable-http'
  options: {
    /* ... */
  },
})
```

---

For details on each implementation, see the README and comments in each subfolder.
