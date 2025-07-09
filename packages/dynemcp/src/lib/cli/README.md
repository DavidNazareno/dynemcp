# DyneMCP CLI Module

## Overview

The DyneMCP CLI provides a unified, extensible command-line interface for the DyneMCP framework. It cubre los comandos de ciclo de vida del servidor: desarrollo y producción. El CLI es modular, type-safe, y diseñado para mantenibilidad y fácil extensión.

---

## Directory Structure

```
cli/
  README.md         # This documentation
  index.ts          # Public re-export: { cli, dev, ConsoleLogger, StderrLogger }
  core/
    cli.ts          # Main CLI entry point: command registration and handlers
    dev.ts          # Handler for 'dev' command (inspector/default mode)
    logger.ts       # Logger interface and implementations (console, stderr)
    run.ts          # Main dev server runner (hot-reload, shutdown, inspector integration)
    types.ts        # CLI-specific types (DevOptions, etc.)
    utils.ts        # Helpers (spawnProcess, transport/host/port resolution)
    handler/
      start.ts      # Handler for 'start' command
```

---

## Main Files (core/)

- **cli.ts**: CLI entry point. Sets up all main commands (`dev`, `start`) using yargs and connects them to their handlers.
- **dev.ts**: Handler for the `dev` command. Decides between inspector mode and default dev mode.
- **logger.ts**: Provides `ConsoleLogger` and `StderrLogger` for colored and error stream logging.
- **run.ts**: Handles dev server logic, hot-reload, server startup, graceful shutdown, and MCP Inspector integration.
- **types.ts**: Defines types for CLI argument parsing and handler logic.
- **utils.ts**: Utility functions for process spawning and transport/host/port resolution.
- **handler/**: Contains command-specific handler for `start`.

---

## Public API

- **cli**: The yargs CLI instance, ready to be executed.
- **dev**: Programmatic entrypoint for dev mode (used by the CLI and tests).
- **ConsoleLogger, StderrLogger**: Logger implementations for consistent output.

---

## Supported Commands

- `dev [mode]`  
  Starts the development server. Supports `inspector` mode for advanced debugging.
- `start`  
  Starts the server in production mode.

### Common Options

- `--config, -c` Path to `dynemcp.config.ts` (default: auto-detect)
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

# Start production server
dynemcp start -c ./myconfig.ts
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
- Only expose the minimal public API (`cli`, `dev`, `ConsoleLogger`, `StderrLogger`).
- Use async/await for all I/O and process management.
- Keep command handlers minimal; delegate logic to helpers or submodules.
- Document new commands and options in this README.
- Use high-level comments in code to clarify the purpose of each main block.

---

## License

MIT
