# DyneMCP Build System

The DyneMCP build system is a modular, zero-config, production-ready solution for building, bundling, and managing DyneMCP projects.

## Architecture

- **Modular:** The build system is split into focused modules:

  - `main/` — Main build API (build, watch, clean, analyze, CLI build)
  - `bundler/` — Advanced bundling and analysis (esbuild-based)
  - `config/` — Zero-config, type-safe configuration utilities
  - `bin/` — CLI entrypoint and helpers

- **Zero-config:** Always uses a default, production-optimized configuration. No user overrides.

- **Type-safe:** All types and interfaces are exported for external use.

## Public API

You can import the following from the build system:

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
  loadConfig,
  getBuildConfig,
  DyneMCPConfig,
  // Advanced: bundler helpers
} from '@dynemcp/build'
```

## CLI

The DyneBuild CLI is available as an executable and is not meant to be imported as a library.  
See [`bin/README.md`](./bin/README.md) for usage and commands.

## Best Practices

- **Do not override build options:** The build is always optimized for production.
- **Use the provided API:** All build operations should go through the exported functions for consistency and type safety.
- **Keep logic modular:** Extend the build system by adding new modules in the appropriate subfolder and re-exporting from `index.ts`.

## Directory Structure

```
build/
  main/
  bundler/
  config/
  bin/
  index.ts
  README.md
```

---

For details on each module, see their respective `README.md` files.
