# DyneMCP CLI Module

## Overview

The DyneMCP CLI provides a unified, extensible command-line interface for the DyneMCP framework. It covers all developer-facing commands: development server, build, analyze, clean, and production server management. The CLI is modular, type-safe, and designed for maintainability and easy extension.

---

## Directory Structure

```
cli/
  README.md         # This documentation
  index.ts          # Public re-export: { cli, dev }
  core/
    cli.ts          # Main CLI entry point: command registration and handlers
    dev.ts          # Handler for 'dev' command (inspector/default mode)
    logger.ts       # Logger interface and implementations (console, stderr)
    run-default-mode.ts # Default dev server runner (hot-reload, shutdown)
    types.ts        # CLI-specific types (DevOptions, etc.)
    utils.ts        # Helpers (spawnProcess, transport/host/port resolution)
    inspector.ts    # Inspector launcher (HTTP or stdio mode)
    handler/        # Command-specific handlers (build, start, clean, analyze)
```

---

## Main Files (core/)

- **cli.ts**: CLI entry point. Sets up all main commands (`dev`, `build`, `start`, `clean`, `analyze`) using yargs and connects them to their handlers.
- **dev.ts**: Handler for the `dev` command. Decides between inspector mode and default dev mode.
- **logger.ts**: Provides `ConsoleLogger` and `StderrLogger` for colored and error stream logging.
- **run-default-mode.ts**: Handles hot-reload, server startup, and graceful shutdown in dev mode.
- **types.ts**: Defines types for CLI argument parsing and handler logic.
- **utils.ts**: Utility functions for process spawning and transport/host/port resolution.
- **inspector.ts**: Handles launching the MCP Inspector in HTTP or stdio mode, including server startup and process management.

---

## Public API

- **cli**: The yargs CLI instance, ready to be executed.
- **dev**: Programmatic entrypoint for dev mode (used by the CLI and tests).

---

## Supported Commands

- `dev [mode]`  
  Starts the development server. Supports `inspector` mode for advanced debugging.
- `build`  
  Builds the project for production. Supports `--clean` and `--analyze`.
- `start`  
  Starts the server in production mode.
- `clean`  
  Cleans the build directory.
- `analyze`  
  Analyzes project dependencies.

### Common Options

- `--config, -c` Path to `dynemcp.config.ts` (default: auto-detect)
- `--clean` Clean before building
- `--analyze` Analyze dependencies after build
- `--transport` Transport type (`stdio`, `streamable-http`, `console`)
- `--port` HTTP server port (default: 3000)
- `--host` HTTP server host (default: localhost)

---

## Usage Examples

```
# Start dev server (auto transport)
dynemcp dev

# Start dev server in inspector mode
dynemcp dev inspector

# Build for production
dynemcp build --clean

# Start production server
dynemcp start -c ./myconfig.ts

# Clean build directory
dynemcp clean

# Analyze dependencies
dynemcp analyze
```

---

## Extending the CLI

- Add new commands in `core/cli.ts` using the yargs API.
- Add new helpers in `core/utils.ts`.
- Add new types in `core/types.ts`.
- Use `ConsoleLogger` and `StderrLogger` for consistent output.
- Place command-specific logic in `core/handler/` for separation of concerns.

---

## Best Practices

- Keep all implementation logic in `core/` and only re-export from `index.ts`.
- Only expose the minimal public API (`cli`, `dev`).
- Use async/await for all I/O and process management.
- Keep command handlers minimal; delegate logic to helpers or submodules.
- Document new commands and options in this README.
- Use high-level comments in code to clarify the purpose of each main block.

---

## License

MIT
