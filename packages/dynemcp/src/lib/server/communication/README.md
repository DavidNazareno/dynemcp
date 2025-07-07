# DyneMCP Communication Module

This module centralizes all communication logic and protocols for DyneMCP, strictly following the MCP SDK and professional architecture best practices.

## Directory Structure

```
communication/
  core/
    interfaces.ts      # Base contracts: Transport, JSONRPCMessage, config schemas (Zod), etc.
    errors.ts          # Custom error classes for transports
    schemas.ts         # Zod schemas for transport config validation
    factory.ts         # Transport factory and public entrypoint (createTransport)
    jsonrpc.ts         # Type guards and validation for JSON-RPC
  http/
    server.ts          # Streamable HTTP server implementation (SSE, session support)
    client.ts          # (future) HTTP client
    sse-legacy.ts      # (optional) SSE legacy
  stdio/
    server.ts          # STDIO transport implementation
    client.ts          # (future) STDIO client
  utils.ts             # Common utilities (future)
  index.ts             # Centralized exports (all public APIs)
```

---

## Main Files (core/)

- **interfaces.ts**: Contracts for Transport, JSON-RPC messages, and transport configs. All custom transports must implement the `Transport` interface.
- **errors.ts**: Custom error classes for transport-related errors, with helpers for connection and message errors.
- **schemas.ts**: Zod schemas for validating transport config options. Supports discriminated unions for multiple transport types.
- **factory.ts**: Public entrypoint, re-exports, and the `createTransport` factory function to instantiate the correct transport by config.
- **jsonrpc.ts**: Type guards and validation utilities for JSON-RPC messages.

---

## Philosophy

- **SDK Fidelity:** All implementations follow the MCP SDK contract and formats.
- **Modularity:** Each protocol and utility is in its own file/folder.
- **Extensibility:** Easy to add new protocols (WebSocket, gRPC, etc.) by implementing the `Transport` interface and registering in the factory.
- **Security:** Includes SDK security recommendations (origin validation, TLS, etc.).
- **Strong Typing:** TypeScript and Zod for robustness and maintainability.

---

## Current Implementations

- **STDIO:** Communication via standard streams (ideal for CLI and local processes).
  - `StdioTransport` implements the `Transport` interface.
  - Methods: `start`, `connect`, `send`, `close`, and event handlers (`onclose`, `onerror`, `onmessage`).
  - Supports dynamic root updates and protocol versioning.
- **Streamable HTTP:** HTTP communication with support for SSE (Server-Sent Events) and session management.
  - `HTTPServers` implements the `Transport` interface for HTTP/SSE.
  - Methods: `send`, session management, SSE client management, and event handlers.
  - Uses Express middleware for security and extensibility.
- **SSE Legacy:** (optional) For backward compatibility.

---

## Configuration & Validation

- All transport configurations are validated using Zod schemas (`schemas.ts`).
- Example schemas:
  - `StdioTransportConfigSchema`: `{ type: 'stdio', command?: string, args?: string[] }`
  - `HTTPTransportConfigSchema`: `{ type: 'streamable-http', url: string, sessionId?: string, headers?: Record<string, string> }`
- The `TransportConfigSchema` is a discriminated union of all supported transport configs.

---

## Extending

To add a new transport:
1. Implement the `Transport` interface in a new file (e.g., `websocket/server.ts`).
2. Add a Zod schema for its configuration in `core/schemas.ts`.
3. Register the new transport in the `createTransport` factory (`core/factory.ts`).
4. Export it in `index.ts` if you want it public.

---

## Usage Example

```typescript
import { createTransport } from './communication/core/factory'

const stdioTransport = createTransport({
  type: 'stdio',
  options: {
    // command, args, etc. (optional)
  },
})

const httpTransport = createTransport({
  type: 'streamable-http',
  options: {
    url: 'http://localhost:3000',
    sessionId: 'abc123',
    headers: { Authorization: 'Bearer ...' },
  },
})
```

---

## Exports

All public types, errors, schemas, and transport implementations are re-exported from `index.ts` for easy import:

```typescript
import { Transport, StdioTransport, HTTPServers, TransportConfigSchema, createTransport } from '@/server/communication'
```

---

For details on each implementation, see the README and comments in each subfolder. All code comments and documentation are in English for consistency.
