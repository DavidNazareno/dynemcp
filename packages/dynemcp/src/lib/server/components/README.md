# DyneMCP Components Module

This module provides the core utilities for **dynamic loading** and **declarative creation** of MCP tools, resources, and prompts in the DyneMCP framework. It is designed for extensibility, plug-and-play development, and best practices in modular MCP server design.

## Features

- **Dynamic component loading**: Recursively discover and validate tools, resources, and prompts from your project structure.
- **Component creation helpers**: Factory functions to define tools, resources, and prompts with strong typing and error handling.
- **Type safety**: All helpers are strictly typed and compatible with the MCP SDK.
- **Extensible**: Easily add new tools/resources/prompts by dropping files or using the provided factories.

---

## Directory Structure

```
components/
  README.md             # This documentation
  index.ts              # Public API exports for component loading/creation
  component-loader.ts   # Generic and specialized loaders for dynamic discovery
  component-creators.ts # Factory functions for tools, resources, prompts, templates
  core/
    loaders/
      dynamic-loader.ts     # Dynamic import and normalization utilities
      file-discovery.ts     # Recursively discovers component files
      ts-compiler.ts        # TypeScript compilation and import resolution
      validators.ts         # Type guards for validating loaded components
```

---

## Main Files

- **component-loader.ts**: Orchestrates loading of tools, resources, and prompts. Provides generic and specialized loaders for plug-and-play discovery.
- **component-creators.ts**: Factory helpers for creating tools, resources, prompts, and resource templates.
- **core/loaders/dynamic-loader.ts**: Dynamic import and normalization utilities for components.
- **core/loaders/file-discovery.ts**: Recursively discovers component files for dynamic loading.
- **core/loaders/ts-compiler.ts**: Utilities for TypeScript compilation and import resolution.
- **core/loaders/validators.ts**: Type guards for validating loaded tools, resources, and prompts.

---

## Public API

```ts
import {
  loadToolsFromDirectory,
  loadResourcesFromDirectory,
  loadPromptsFromDirectory,
  createTool,
  createFileResource,
  createDynamicResource,
  createPrompt,
  createSystemPrompt,
  createChatPrompt,
} from '@dynemcp/dynemcp/server/components'
```

## Example: Dynamic Loading

```ts
import { loadToolsFromDirectory } from '@dynemcp/dynemcp/server/components'

const { components: tools, errors } = await loadToolsFromDirectory({
  enabled: true,
  directory: './src/tools',
})
```

## Example: Creating a Tool

```ts
import { createTool } from '@dynemcp/dynemcp/server/components'
import { z } from 'zod'

const greetTool = createTool(
  'greet',
  'Greets the user',
  { name: z.string() },
  async ({ name }) => ({
    content: [{ type: 'text', text: `Hello, ${name}!` }],
  })
)
```

## Example: Creating a File Resource

```ts
import { createFileResource } from '@dynemcp/dynemcp/server/components'

const readmeResource = createFileResource('./README.md', {
  name: 'Project README',
  contentType: 'text/markdown',
})
```

---

## Best Practices

- Use the dynamic loaders for plug-and-play extensibility in your MCP server.
- Use the factory helpers to ensure all custom tools/resources/prompts are MCP-compliant.
- Organize your components in clear directories and follow naming conventions for best results.
- Use high-level comments in code to clarify the purpose of each main block.

---

## License

MIT
