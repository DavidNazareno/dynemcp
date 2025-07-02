# DyneMCP

**DyneMCP** is a modern, modular framework for building, running, and managing Model Context Protocol (MCP) servers and tools. It provides a unified CLI, a robust build system, and a highly extensible server runtime—all designed for zero-config, production-ready workflows.

---

## What is DyneMCP?

DyneMCP is a professional, batteries-included framework for MCP server development. It brings together:
- **Unified CLI** for all developer and ops tasks
- **Zero-config, type-safe build system**
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
- **Zero-config:** always uses a default, production-ready config.
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
npm install dynemcp
# or
yarn add dynemcp
# or
pnpm add dynemcp
```

### CLI Examples

```sh
# Start dev server
dynemcp dev

# Start dev server with Inspector
dynemcp dev inspector

# Build for production
dynemcp build --clean

# Start production server
dynemcp start

# Clean build directory
dynemcp clean

# Analyze dependencies
dynemcp analyze
```

---

## Why DyneMCP?

- **Zero-config, production-ready:** No need to tweak endless configs—just build and deploy.
- **Professional, modular architecture:** Easy to extend, maintain, and onboard new developers.
- **Security-first:** Built-in checks and best practices to keep your deployments safe.
- **Full MCP protocol compliance:** Works out of the box with all MCP clients and hosts.
- **Clear documentation:** Every module and submodule is documented for clarity and maintainability.

---

## License

MIT
