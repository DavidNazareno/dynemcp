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
- **Advanced Sections**: The configuration supports advanced sections for `logging`, `debug`, `performance`, `security` y `config` (env), todas con tipado y validación estricta y valores por defecto.

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

### Default Sections Example

```ts
import {
  DEFAULT_LOGGING_CONFIG,
  DEFAULT_DEBUG_CONFIG,
  DEFAULT_PERFORMANCE_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  DEFAULT_ENV_CONFIG,
} from '@/server/config'

console.log(DEFAULT_LOGGING_CONFIG)
// { enabled: true, level: 'info', format: 'text', timestamp: true, colors: true }
```

### Example dynemcp.config.ts

```ts
import { defineConfig } from '@/config'

export default defineConfig({
  server: { name: 'my-server', version: '1.0.0' },
  tools: { enabled: true, directory: './src/tools' },
  // ...
  logging: {
    enabled: true,
    level: 'info',
    format: 'text',
    timestamp: true,
    colors: true,
  },
  debug: {
    enabled: false,
    verbose: false,
    showComponentDetails: false,
    showTransportDetails: false,
  },
  performance: {
    maxConcurrentRequests: 100,
    requestTimeout: 30000,
    memoryLimit: '512mb',
    enableMetrics: false,
  },
  security: {
    enableValidation: true,
    strictMode: false,
    allowedOrigins: ['*'],
    rateLimit: {
      enabled: false,
      maxRequests: 100,
      windowMs: 900000,
    },
  },
  config: {
    env: true,
  },
})
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

### Rate Limiting Configuration

You can configure rate limiting for your DyneMCP server in two ways:

1. **Globally** via `security.rateLimit`:

```ts
security: {
  rateLimit: {
    enabled: true,
    maxRequests: 100, // requests per windowMs
    windowMs: 900000, // 15 minutes
  }
}
```

2. **Per-transport** via `transport.options.rateLimit` (overrides global):

```ts
transport: {
  type: 'streamable-http',
  options: {
    rateLimit: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 50, // 50 requests per IP per window
      message: {
        error: 'Too many requests, slow down!',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    },
  },
}
```

**Precedence:**

- If `transport.options.rateLimit` is set, it is used.
- Otherwise, if `security.rateLimit.enabled` is true, it is used.
- Otherwise, a safe default (100 requests/15 min) is used.

See [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) for all available options.

## Best Practices

- **Validate all configuration** using the provided schemas before using it in your application.
- **Do not duplicate validation logic** in other parts of the codebase—always use the loader and schemas.
- **Keep all config-related logic in this module** for maintainability and clarity.
- **Extend types and schemas here** if you add new configuration options to the framework.
- **For JWT authentication, set the `expectedAudience` option in your middleware or config to enforce that only tokens intended for this server are accepted.**
  - Example:
    ```ts
    app.use(
      jwtAuthMiddleware({
        allowedRoles: ['admin'],
        expectedAudience: 'my-mcp-server',
      })
    )
    ```
  - This prevents token passthrough and confused deputy attacks. In production, a warning is shown if not set.

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
