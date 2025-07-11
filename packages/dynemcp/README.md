# DyneMCP

**DyneMCP** is a modern, modular framework for building, running, and managing Model Context Protocol (MCP) servers and tools. It provides a unified CLI, a robust build system, and a highly extensible server runtime—all designed for zero-config, production-ready workflows.

---

## What is DyneMCP?

DyneMCP is a professional, batteries-included framework for MCP server development. It brings together:

- **Unified CLI** for all developer and ops tasks
- **Extensible, robust server runtime**
- **Best-in-class security and production defaults**
- **Clear, modular architecture for easy onboarding and extension**

Whether you are building a custom LLM server, integrating tools/resources, or deploying at scale, DyneMCP gives you a solid, maintainable foundation.

---

## Architecture Overview

```
dynemcp/
  src/
    cli/           # CLI logic (modular, yargs-based)
    build/         # Build system (main, config, bundler, bin)
    server/        # Server runtime (main, api, registry, config, communication)
    global/        # Shared global config/constants
    shared/        # (Optional) Shared utilities
  package.json
  README.md        # (You are here)
```

---

## Main Modules (with links to details)

### 1. CLI ([src/cli/](./src/cli/README.md))

- Unified entrypoint for all developer commands: `dev`, `build`, `start`, `clean`, `analyze`.
- Modular, type-safe, and easy to extend.
- See [`src/cli/README.md`](./src/cli/README.md) for commands, options, and extension.

### 2. Build System ([src/build/](./src/build/README.md))

- Handles all build, watch, clean, analyze, and CLI bundling tasks.
- Modular: includes `main/`, `bundler/`, `config/`, and `bin/` submodules.
- See [`src/build/README.md`](./src/build/README.md) for API, CLI, and best practices.

### 3. Server ([src/server/](./src/server/README.md))

- The DyneMCP server runtime: fast, extensible, and robust.
- Supports custom tools, resources, and prompts.
- Modular: includes `main/`, `api/`, `registry/`, `config/`, `communication/` submodules.
- See [`src/server/README.md`](./src/server/README.md) for extension points and architecture.

### 4. Global Config ([src/global/config-all-contants.ts](./src/global/config-all-contants.ts))

- Centralized, minimal set of constants and helpers shared across modules.

### 5. Shared Utilities ([src/shared/](./src/shared/))

- (Optional) Place for cross-cutting helpers and utilities.

---

## Submodule Summaries

### CLI

- **Purpose:** Unified command-line interface for all dev/build/ops tasks.
- **Highlights:** Modular, type-safe, extensible, robust error handling.

### Build System

- **Purpose:** Zero-config, type-safe, production-optimized build and bundling.
- **Highlights:** Modular (`main`, `bundler`, `config`, `bin`), esbuild-based, manifest/report generation, CLI tool support.

### Bundler

- **Purpose:** Core logic for compiling, optimizing, and analyzing DyneMCP projects.
- **Highlights:** Dependency analysis, manifest/HTML report, bundle optimization, shared logging.

### Config

- **Purpose:** Centralizes all configuration logic for DyneMCP builds and runtime.
- **Highlights:** Zod-based schema, strict validation, zero-config philosophy.

### Server

- **Purpose:** Fast, extensible MCP server runtime.
- **Highlights:** Modular (main, api, registry, config, communication), supports custom tools/resources/prompts, robust protocol compliance.

---

## Security Best Practices

- **JWT authentication is required in production.**
- Always set the `expectedAudience` option in your JWT middleware to ensure only tokens intended for your DyneMCP server are accepted. This prevents token passthrough and confused deputy attacks.
- DyneMCP includes an **automatic check of critical environment variables** at server startup. If a required variable is missing or insecure, the server will not start and will display a clear error.
- See [`src/server/api/auth/jwt-middleware.ts`](./src/server/api/auth/jwt-middleware.ts) for details and usage.

---

## Best Practices

- Expose only the minimal public API at the top level.
- Use async/await for all I/O and process management.
- Keep command handlers and entrypoints minimal; delegate logic to helpers or submodules.
- Document new commands, options, and modules in their respective READMEs.
- Keep all implementation logic in `core/` folders; only re-export from `index.ts`.

---

## Quickstart

### Install

```sh
pnpm add dynemcp
```

### CLI Examples

```sh
# Start dev server
dynemcp dev

# Start dev server with Inspector
dynemcp dev inspector

# Start production server
dynemcp start

```

---

## Why DyneMCP?

- **Professional, modular architecture:** Easy to extend, maintain, and onboard new developers.
- **Security-first:** Built-in checks and best practices to keep your deployments safe.
- **Full MCP protocol compliance:** Works out of the box with all MCP clients and hosts.
- **Clear documentation:** Every module and submodule is documented for clarity and maintainability.

---

## Declaring Roots

Roots define the boundaries where the server should operate. You can declare your roots in a simple and type-safe way using the `root` helper from the API:

```ts
// src/roots/roots.ts
import { root } from '@dynemcp/dynemcp/server/api/core/root'

export default root([
  {
    uri: 'file:///home/user/projects/myapp',
    name: 'My Project',
  },
])
```

- The framework will automatically load and notify these roots to the MCP server at startup.
- No manual notification or extra logic is required.

### Configuration

You can configure the autoload of roots in your `dynemcp.config.ts`:

```ts
export default {
  roots: {
    enabled: true,
    directory: './src/roots',
    pattern: '*.ts', // optional
    exclude: [], // optional
  },
  // ...
}
```

- The default file is `roots.ts` in the configured directory.
- You can disable autoload by setting `enabled: false`.

## OAuth2/OIDC Authorization (Resource Server)

DyneMCP supports acting as an OAuth2/OIDC-protected MCP server. You can configure the authorization server (issuer) and audience directly in your config file:

```ts
// dynemcp.config.ts
export default {
  // ...
  transport: {
    type: 'streamable-http',
    options: {
      port: 3000,
      endpoint: '/mcp',
      oauth2Issuer: 'https://your-auth-server', // OIDC issuer URL
      oauth2Audience: 'https://your-mcp-server', // Resource URI (audience)
      // ...other options
    },
  },
}
```

- The server will validate Bearer tokens using the issuer and audience you provide.
- The endpoint `/.well-known/oauth-protected-resource` will advertise your authorization server to clients.
- If a request is unauthorized, the server responds with `401 Unauthorized` and a `WWW-Authenticate` header as required by the MCP protocol.

**Note:** In development, a local JWT middleware is used for convenience. In production, only OAuth2/OIDC is supported.

---

## License

MIT
