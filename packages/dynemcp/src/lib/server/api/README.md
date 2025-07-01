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
    messages: [{ role: 'user', content: { type: 'text', text: 'Say hello!' } }],
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

## Dynamic Resource Templates

Dynamically expose resources using URI templates (RFC 6570) with the `resourceTemplate` API. This allows you to define resources whose content is generated on demand, and whose URI can include parameters.

### Usage

Create a `resource-template.ts` file inside any resource folder (e.g., `src/resources/user-data/resource-template.ts`).

```ts
import { resourceTemplate } from '@dynemcp/dynemcp'

export default resourceTemplate({
  uriTemplate: '/user-data/{id}',
  name: 'User Data Dynamic Resource',
  description: 'Dynamic resource for user data',
  mimeType: 'text/plain',
  async getContent(params) {
    // params.id will be available
    return `Dynamic content for user with id: ${params.id}`
  },
})
```

- The framework will automatically discover and register all `resource-template.ts` files in subfolders of `resources/`.
- The resource will be available to MCP clients using the defined URI template.

## 🔒 Built-in JWT Authentication Middleware

The DyneMCP API provides a ready-to-use JWT authentication middleware for Express-based servers.

- Import it from `@dynemcp/dynemcp/auth/jwt-middleware`.
- Use it in your server or reference it in your config for automatic integration.
- In production, authentication is required and the server will refuse to start without it.

### Usage Example

```ts
// dynemcp.config.ts
transport: {
  type: 'streamable-http',
  options: {
    authentication: {
      path: './src/auth/jwt-middleware.ts'
    }
  }
}
```

### Example: Making an authenticated request

Generate a JWT token (for example, using [jwt.io](https://jwt.io/) or any JWT library) with your secret:

```sh
export JWT_SECRET=changeme
node -e "console.log(require('jsonwebtoken').sign({ user: 'alice', role: 'admin' }, process.env.JWT_SECRET))"
```

Then, make a request to your DyneMCP server:

```sh
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{ "jsonrpc": "2.0", "method": "tools/list", "id": 1 }'
```

If the token is valid, you'll get a response. If not, you'll get a 401 Unauthorized error.

## License

MIT
