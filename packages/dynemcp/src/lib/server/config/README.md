# DyneMCP Configuration Module

This module provides all configuration types, schemas, utilities, and defaults required for loading, validating, and managing configuration in the DyneMCP framework.

## Purpose

- Centralize all configuration logic for the framework
- Provide strong typing and runtime validation for configuration files
- Enable easy extension and maintenance of configuration options
- Ensure robust error handling and clear defaults

## Structure

```
config/
  core/
    defaults.ts    # Default values for all config sections
    errors.ts      # Custom error classes for config errors
    interfaces.ts  # TypeScript interfaces and types for config
    loader.ts      # Utilities for loading and merging config
    schemas.ts     # Zod schemas for runtime validation
    transport.ts   # Transport-specific config schemas/types
  index.ts         # Public API entrypoint for config
```

## Key Concepts

- **TypeScript Types**: All configuration objects are strongly typed for safety and autocompletion.
- **Zod Schemas**: All configuration is validated at runtime using Zod schemas before being used by the framework.
- **Defaults**: All config sections have centralized defaults, making it easy to extend or override.
- **Error Handling**: Custom error classes provide clear, actionable error messages for configuration issues.
- **Transport Config**: Transport configuration is modular and validated, supporting all built-in and custom transports.

## Usage

### Loading Configuration

```ts
import { loadConfig } from '@/server/config'

const config = await loadConfig() // Loads, merges, and validates config
```

### Accessing Types and Schemas

```ts
import type { DyneMCPConfig } from '@/server/config'
import { ConfigSchema } from '@/server/config'
```

### Creating a Default Config

```ts
import { createDefaultConfig } from '@/server/config'
const defaultConfig = createDefaultConfig()
```

### Error Handling

```ts
import { ConfigError } from '@/server/config'
try {
  await loadConfig()
} catch (err) {
  if (err instanceof ConfigError) {
    // Handle config-specific error
  }
}
```

## Best Practices

- **Validate all configuration** using the provided schemas before using it in your application.
- **Do not duplicate validation logic** in other parts of the codebase—always use the loader and schemas.
- **Keep all config-related logic in this module** for maintainability and clarity.
- **Extend types and schemas here** if you add new configuration options to the framework.

## Extending Configuration

1. Add new fields to `interfaces.ts` and `schemas.ts`.
2. Add defaults in `defaults.ts`.
3. Update loader logic if needed.
4. Add tests for new config options.

## Maintainers

- Keep this module in sync with the rest of the framework.
- Review changes for backwards compatibility and clarity.
- Document any new configuration options or breaking changes.

---

For more information, see the main DyneMCP documentation or contact the maintainers.
