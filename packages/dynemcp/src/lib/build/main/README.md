# DyneMCP Main Build Module

This module provides the main build system for DyneMCP projects. It is designed to be modular, type-safe, and production-ready, following modern best practices and a zero-config philosophy.

## Architecture

- **Modular:** All implementation logic is organized in the `core/` directory. The `index.ts` file only re-exports the public API.
- **Zero-config:** The build system uses a default, production-ready configuration. Users cannot override build options, ensuring consistent, optimized builds.
- **Type-safe:** All types and interfaces are defined in `core/interfaces.ts` and are exported for external use.
- **Extensible:** The core is split into focused modules: `build`, `buildCli`, `watch`, `clean`, and `analyze`.

## Public API

You can import the following functions and types from this module:

```ts
import {
  build,
  buildCli,
  watch,
  clean,
  analyze,
  DyneMCPBuildOptions,
  BuildResult,
  BuildConfig,
} from '@dynemcp/build/main'
```

### Functions

- `build(options: DyneMCPBuildOptions): Promise<BuildResult>` — Main build function for production.
- `buildCli(options: DyneMCPBuildOptions): Promise<BuildResult>` — Build the CLI entrypoint.
- `watch(options: DyneMCPBuildOptions): Promise<BuildContext>` — Build in watch mode with hot-reloading.
- `clean(options: { outDir?: string; configPath?: string }): Promise<void>` — Clean the build output directory.
- `analyze(options: { entryPoint?: string; configPath?: string }): Promise<any>` — Analyze project dependencies.

### Types

- `DyneMCPBuildOptions` — Options for building a DyneMCP project.
- `BuildResult` — Result of a build operation.
- `BuildConfig` — The default build configuration type.

## Best Practices

- **Do not override build options:** The build is always optimized for production.
- **Use the provided API:** All build operations should go through the exported functions for consistency and type safety.
- **Keep logic in `core/`:** If you extend the build system, add new logic as a new module in `core/` and re-export it from `index.ts`.

## Directory Structure

```
main/
  core/
    build.ts
    build-cli.ts
    watch.ts
    clean.ts
    analyze.ts
    interfaces.ts
  index.ts
  README.md
```

---

For more details, see the [DyneMCP documentation](../../../../README.md).
