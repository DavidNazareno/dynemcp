# DyneMCP Registry Module

## Overview

The DyneMCP Registry module provides a robust, modular system for dynamically loading, caching, and managing tools, prompts, and resources within the DyneMCP framework. It is designed for extensibility, type safety, and maintainability.

**All previous registry functionality is preserved:**

- Batch loading of all components (tools, resources, prompts) from the filesystem
- Tool validation and error/warning logging
- Helpers for querying: `getAllTools`, `getTool`, `getAllResources`, `getResource`, `getAllPrompts`, `getPrompt`
- Registry statistics (`stats`), clear/reset (`clear`), and loaded state (`loaded`)
- Singleton instance for convenience

## Architecture

The module is organized into the following components:

- **core/interfaces.ts**: Public types and interfaces for registry items, loader, storage, and the registry itself.
- **core/schemas.ts**: Zod schemas for validating registry item configuration and dynamic loading.
- **core/defaults.ts**: Default values and settings for the registry.
- **core/errors.ts**: Custom error classes for registry-specific errors.
- **core/loader.ts**: Logic for dynamically loading tools, prompts, and resources.
- **core/storage.ts**: In-memory storage backend for caching registry items.
- **core/registry.ts**: Main `DyneMCPRegistry` class that orchestrates loading, validation, and querying.
- **core/index.ts**: Public API exports for the core module.
- **index.ts**: Entrypoint for consuming the registry module.

## Usage

```ts
import {
  DyneMCPRegistry,
  DefaultRegistryLoader,
  InMemoryRegistryStorage,
  registry, // Singleton instance
} from '@/registry'

// Batch load all components from the filesystem
await registry.loadAll({
  tools: { enabled: true, directory: './tools' },
  resources: { enabled: true, directory: './resources' },
  prompts: { enabled: true, directory: './prompts' },
})

// Query helpers
const allTools = registry.getAllTools()
const tool = registry.getTool('my-tool')
const stats = registry.stats

// Load a tool by id (dynamic, on-demand)
const loadedTool = await registry.get('tool', 'my-tool')
```

## Extension Points

- **Custom Loader**: Implement the `RegistryLoader` interface to customize how modules are loaded (e.g., from remote sources).
- **Custom Storage**: Implement the `RegistryStorage` interface for persistent or distributed caching.
- **Validation**: Use or extend the Zod schemas in `core/schemas.ts` for additional validation needs.

## Best Practices

- Keep business logic out of the registry; use it only for dynamic loading and caching.
- Validate all dynamic inputs using the provided schemas.
- Use dependency injection for loader and storage to maximize testability and flexibility.

## Error Handling

Custom errors such as `RegistryItemNotFoundError` and `RegistryItemLoadError` are provided for robust error handling and debugging.

## Migration from Previous Structure

- All previous methods and helpers are preserved, but the code is now modular and maintainable.
- When loading components, the registry automatically maps them to the correct `RegistryItem` format.
- You can safely remove the old `registry.ts`, `registry-storage.ts`, and `registry-loader.ts` files after migrating to this structure.

## Example: Adding a New Tool

1. Place your tool module in the appropriate directory (e.g., `tools/my-tool`).
2. Use the registry to load it dynamically:
   ```ts
   const tool = await registry.get('tool', 'my-tool')
   ```

## License

MIT
