# DyneMCP Components Module

This module provides utilities for loading and creating DyneMCP components—tools, resources, and prompts—in a modular, type-safe, and extensible way.

## Features

- **Component loaders**: Recursively load tools, resources, and prompts from directories, with validation and error reporting.
- **Component creators**: Factory functions for defining tools, resources, and prompts with strong typing and best practices.

## Public API

```ts
import {
  loadComponentsFromDirectory,
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

## Example: Loading Tools from a Directory

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

const myTool = createTool(
  'greet',
  'Greets the user',
  { name: z.string() },
  async ({ name }) => ({
    content: [{ type: 'text', text: `Hello, ${name}!` }],
  })
)
```

## Extensibility

- All helpers are strictly typed and can be extended for custom component types.
- Error handling and validation are built-in for robust development.

## License

MIT
