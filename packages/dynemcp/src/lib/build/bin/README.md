# DyneBuild CLI

The DyneBuild CLI is the command-line interface for building, cleaning, and analyzing DyneMCP projects. It is modular, robust, and designed for developer productivity.

## Architecture

- **Modular:** All CLI logic is implemented in `core/cli.ts`. The `index.ts` file is a minimal entrypoint that delegates to the core.
- **Extensible:** The CLI supports multiple commands (`build`, `watch`, `cli`, `clean`, `analyze`) and can be extended with new commands in the future.
- **Type-safe:** All options and helpers are typed for reliability and maintainability.

## Usage

Run the CLI from your project root:

```sh
dynebuild [command] [options]
```

### Commands
- `build` — Build the project (default)
- `watch` — Build in watch mode (hot-reloading)
- `cli` — Build the CLI tool
- `clean` — Clean the build directory
- `analyze` — Analyze project dependencies

### Options
- `-c, --config <path>` — Path to the config file (default: `./dynemcp.config.json`)
- `--clean` — Clean build directory before building
- `--analyze` — Analyze dependencies and generate report
- `--manifest` — Generate build manifest
- `--html` — Generate HTML build report
- `--watch` — Build in watch mode
- `--cli` — Build as CLI tool
- `-h, --help` — Show help message
- `-v, --version` — Show version

### Examples
```sh
dynebuild                    # Build with default config
dynebuild --clean --analyze  # Clean and build with analysis
dynebuild watch              # Build in watch mode
dynebuild cli                # Build CLI tool
dynebuild clean              # Clean build directory
dynebuild analyze            # Analyze dependencies
```

## Best Practices
- **Keep logic in `core/`:** All CLI logic should be implemented in `core/cli.ts` for maintainability.
- **Use the provided API:** Always use the exported helpers and commands for consistency.
- **Handle errors gracefully:** The CLI entrypoint handles unhandled promise rejections and unexpected errors.

## Directory Structure

```
bin/
  core/
    cli.ts
  index.ts
  README.md
```

---

For more details, see the [DyneMCP documentation](../../../../README.md). 