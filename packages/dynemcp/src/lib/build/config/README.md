# DyneMCP Build Config Module

This module provides configuration utilities for the DyneMCP build system. It is designed to be zero-config, production-ready, and robust.

## Philosophy

- **Zero-config:** The build system always uses a default, production-optimized configuration. Users cannot override build options, ensuring consistency and reliability.
- **Type-safe:** The configuration schema is defined with Zod and strictly validated.
- **Minimal API:** Only two functions are exported: `loadConfig` (for general config) and `getBuildConfig` (for the build system).

## Public API

```ts
import {
  loadConfig,
  getBuildConfig,
  DyneMCPConfig,
} from '@dynemcp/build/config'
```

### Functions

- `loadConfig(configPath?: string): Promise<DyneMCPConfig>` — Loads and validates the DyneMCP config file.
- `getBuildConfig(): BuildConfig` — Returns the default, production-ready build configuration.

### Types

- `DyneMCPConfig` — The validated config type for DyneMCP projects.

## Best Practices

- **Do not override build options:** The build is always optimized for production.
- **Validate your config:** Use `loadConfig` to ensure your config file is valid before running any build operations.
- **Keep custom logic in your app:** This module is intentionally minimal and should not be extended with custom logic.

## Directory Structure

```
config/
  core/
    schema.ts
  default.ts
  index.ts
  README.md
```

---

For more details, see the [DyneMCP documentation](../../../../README.md).
