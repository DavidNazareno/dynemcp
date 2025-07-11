# DyneMCP CLI Module

## Overview

The DyneMCP CLI provides a unified, extensible command-line interface for the DyneMCP framework. It covers the server lifecycle commands: development and production. The CLI is modular, type-safe, and designed for maintainability and easy extension.

---

## Directory Structure

```
cli/
  README.md         # This documentation
  index.ts          # Public re-export: { cli, ConsoleLogger, StderrLogger }
  core/
    cli.ts          # Main CLI entry point: command registration and handlers
    types.ts        # CLI-specific types (DevOptions, etc.)
    utils.ts        # Helpers (spawnProcess, etc.)
```

---

## Main Files (core/)

- **cli.ts**: CLI entry point. Sets up all main commands (`dev`, `start`) using yargs and connects them to their handlers.
- **types.ts**: Defines types for CLI argument parsing and handler logic (`DevOptions`, etc.).
- **utils.ts**: Utility functions for process spawning and helpers.
- **index.ts**: Re-exports the CLI and logger implementations for public use.

---

## Public API

- **cli**: The yargs CLI instance, ready to be executed.
- **ConsoleLogger, StderrLogger**: Logger implementations for consistent output to stdout and stderr.
- **Logger**: Type for custom logger implementations.

---

## Supported Commands

- `dev [mode]`  
  Starts the development server. Supports `default` and `inspector` modes.
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
# Start dev server (default mode)
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
- Keep all implementation logic in `core/` and only re-export from `index.ts`.
- Only expose the minimal public API (`cli`, `ConsoleLogger`, `StderrLogger`).
- Use async/await for all I/O and process management.
- Keep command handlers minimal; delegate logic to helpers or submodules.
- Document new commands and options in this README.
- Use high-level comments in code to clarify the purpose of each main block.

---

## License

MIT
