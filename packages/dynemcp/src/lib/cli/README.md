# DyneMCP CLI Module

## Overview

This module provides the unified, extensible CLI for the DyneMCP framework. It is responsible for all developer-facing commands, including build, dev, analyze, clean, and server management. The CLI is highly modular, type-safe, and follows best practices for maintainability and extensibility.

---

## Directory Structure

```
cli/
  README.md         # This documentation
  index.ts          # Public re-export: { cli, dev }
  core/
    cli.ts          # Main CLI logic, command registration, handlers
    logger.ts       # Logger interface and implementations
    types.ts        # CLI-specific types (DevOptions, etc.)
    utils.ts        # Helpers (spawnProcess, getEffectiveTransport, etc.)
```

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

- `--config, -c` Path to `dynemcp.config.json` (default: auto-detect)
- `--clean` Clean before building
- `--analyze` Analyze dependencies after build
- `--transport` Transport type (`stdio`, `streamable-http`)
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
dynemcp start -c ./myconfig.json

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

---

## Best Practices

- Keep all implementation logic in `core/` and only re-export from `index.ts`.
- Only expose the minimal public API (`cli`, `dev`).
- Use async/await for all I/O and process management.
- Keep command handlers minimal; delegate logic to helpers or submodules.
- Document new commands and options in this README.

---

## License

MIT
