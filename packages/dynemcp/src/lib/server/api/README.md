# DyneMCP API Module

## Overview

The DyneMCP API module provides the core base classes, types, and utilities for defining tools, prompts, and resources in the DyneMCP framework. This is the main API surface for framework extension and integration, enabling developers to create and expose new capabilities in a type-safe, maintainable, and extensible way.

## Architecture

The module is organized into the following components:

- **core/interfaces.ts**: TypeScript types and utilities for strong typing and schema inference.
- **core/utils.ts**: Utility functions for schema handling, error handling, and response formatting.
- **core/tool.ts**: Base class and helpers for defining tools.
- **core/resource.ts**: Base class for defining resources.
- **core/prompt.ts**: Base class for defining prompts.
- **index.ts**: Entrypoint for consuming the API module, exporting all public types, classes, and utilities.

## Usage

```ts
import {
  DyneMCPTool,
  DyneMCPResource,
  DyneMCPPrompt,
  createTypedTool,
  zodObjectToRawShape,
  createTextResponse,
  createErrorResponse,
  withErrorHandling,
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '@/api'

// Example: Creating a custom tool
class MyTool extends DyneMCPTool {
  name = 'my-tool'
  description = 'A custom tool example'
  inputSchema = { value: z.string() }
  async execute(input: { value: string }) {
    return this.createResult([{ type: 'text', text: `Echo: ${input.value}` }])
  }
}
```

## Extension Points

- **Custom Tools**: Extend `DyneMCPTool` or use `createTypedTool` for quick tool creation.
- **Custom Resources**: Extend `DyneMCPResource` to define new resource types.
- **Custom Prompts**: Extend `DyneMCPPrompt` to define new prompt types.
- **Utilities**: Use the provided helpers for schema, error, and response handling.

## Best Practices

- Keep business logic in your custom tool, resource, or prompt classes; use the API module for structure and type safety.
- Use Zod schemas for input validation and strong typing.
- Leverage utility functions for consistent error and response handling.
- Document your custom classes and methods for maintainability.

## Error Handling

Use `createErrorResponse` and `withErrorHandling` to ensure robust error handling in your tools and prompts.

## License

MIT
