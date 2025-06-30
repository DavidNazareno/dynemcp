# DyneMCP API Module

## Overview

The DyneMCP API module provides the core functions, types, and utilities for defining tools, prompts, resources, and sampling endpoints in the DyneMCP framework. This is the main API surface for framework extension and integration, enabling developers to create and expose new capabilities in a type-safe, maintainable, and extensible way, fully aligned with the Model Context Protocol (MCP) SDK standards.

## Architecture

The module is organized into the following components:

- **core/interfaces.ts**: TypeScript types and utilities for strong typing and schema inference.
- **core/utils.ts**: Utility functions for schema handling, error handling, and response formatting.
- **core/tool.ts**: Functional API for defining tools.
- **core/resource.ts**: Functional API for defining resources.
- **core/prompt.ts**: Functional API for defining prompts.
- **core/sampling.ts**: Functional API for LLM completions (sampling endpoints).
- **index.ts**: Entrypoint for consuming the API module, exporting all public types, functions, and utilities.

## Usage

### Defining a Tool (Functional API)

```ts
import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

export default tool(
  z.object({ value: z.string() }),
  async ({ value }) => {
    return { result: `Echo: ${value}` }
  },
  {
    name: 'echo',
    description: 'Echoes the input value',
  }
)
```

### Defining a Resource

```ts
import { resource } from '@dynemcp/dynemcp'
import { z } from 'zod'

export default resource(
  z.object({ id: z.string() }),
  async ({ id }) => {
    return { data: `Resource for ${id}` }
  },
  {
    name: 'my-resource',
    description: 'Returns resource data by id',
  }
)
```

### Defining a Prompt

```ts
import { prompt } from '@dynemcp/dynemcp'
import { z } from 'zod'

export default prompt(
  z.object({ question: z.string() }),
  async ({ question }) => {
    return { answer: `You asked: ${question}` }
  },
  {
    name: 'simple-prompt',
    description: 'Answers a question',
  }
)
```

### Defining a Sampling Endpoint (LLM Completion)

```ts
import { sample } from '@dynemcp/dynemcp'
import type { SamplingRequest, SamplingResult } from '@dynemcp/dynemcp'

// Usage example (in your server or test):
async function sendMcpRequest(method: string, params: any) {
  // Implement MCP transport here (e.g., HTTP, stdio, etc.)
  throw new Error('Implement MCP transport')
}

const result = await sample(
  {
    messages: [
      { role: 'user', content: { type: 'text', text: 'Say hello!' } }
    ],
    systemPrompt: 'You are a helpful assistant.',
    includeContext: 'thisServer',
    maxTokens: 50,
  },
  sendMcpRequest
)
console.log(result.content.text)
```

## Component Discovery

- **Tools, resources, prompts, and samples** are automatically discovered and loaded from their respective directories (`tools/`, `resources/`, `prompts/`, `samples/`).
- **Roots** are not components, but dynamic context provided by the client/session. Use the helpers and types in `roots/` for parsing and handling root URIs.

## Best Practices

- Use the functional API (`tool`, `resource`, `prompt`, `sample`) for all new components.
- Use Zod schemas for input validation and strong typing. These are automatically converted to JSON Schema for MCP compatibility.
- Keep business logic in your handler functions; use the API module for structure and type safety.
- Document your components for maintainability.

## Error Handling

Use the provided utilities for consistent error and response handling. Handler functions can throw errors, which will be formatted according to MCP standards.

## Migration Notes

- The previous class-based API (`DyneMCPTool`, `DyneMCPResource`, `DyneMCPPrompt`) has been removed in favor of the new functional API.
- All templates and examples use the new API.
- The registry and loader support automatic discovery of all component types, including sampling endpoints.

## License

MIT
