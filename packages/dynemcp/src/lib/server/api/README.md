# DyneMCP API Module

## Overview

The DyneMCP API module provides the core functions, types, and utilities for defining tools, prompts, resources, and sampling endpoints in the DyneMCP framework. This is the main API surface for framework extension and integration, enabling developers to create and expose new capabilities in a type-safe, maintainable, and extensible way, fully aligned with the Model Context Protocol (MCP) SDK standards.

## Architecture

The module is organized into the following components:

- **core/interfaces.ts**: Central contracts for tools, prompts, resources, sampling, and roots. Exposes both SDK-compatible types and internal types for loaded/executable logic.
- **core/resource.ts**: Functional API for defining static and dynamic resources in a type-safe, MCP-compatible way.
- **core/prompt.ts**: Functional API for defining prompt templates and workflows, with argument validation and completion support.
- **core/tool.ts**: Functional API for defining and executing tools, with robust normalization and error handling for MCP protocol compliance.
- **core/sampling.ts**: Functional API for requesting LLM completions (sampling endpoints) using the current DyneMCP instance.
- **core/root.ts**: Utilities for validating, parsing, and normalizing root objects and root lists.
- **core/utils.ts**: Common helpers for schema conversion, response formatting, error handling, pagination, and progress notifications.
- **core/global.d.ts**: Global type declarations extending and adapting MCP SDK types for the DyneMCP workspace.
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

export default resource({
  uri: 'resource://my-resource',
  name: 'My Resource',
  description: 'A sample resource',
  mimeType: 'application/json',
  getContent: () => '{ "hello": "world" }',
})
```

### Defining a Prompt

```ts
import { prompt } from '@dynemcp/dynemcp'
import { z } from 'zod'

export default prompt({
  name: 'simple-prompt',
  description: 'Answers a question',
  arguments: [
    { name: 'question', description: 'Question to answer', required: true },
  ],
  getMessages: async (args) => [
    {
      role: 'user',
      content: { type: 'text', text: `You asked: ${args?.question}` },
    },
  ],
})
```

### Defining a Sampling Endpoint (LLM Completion)

```ts
import { sample } from '@dynemcp/dynemcp'
import type { SamplingRequest, SamplingResult } from '@dynemcp/dynemcp'

// Usage example (in your server or test):
const result = await sample({
  messages: [{ role: 'user', content: { type: 'text', text: 'Say hello!' } }],
  systemPrompt: 'You are a helpful assistant.',
  includeContext: 'thisServer',
  maxTokens: 50,
})
console.log(result.content.text)
```

## Component Discovery

- **Tools, resources, prompts, and samples** are automatically discovered and loaded from their respective directories (`tools/`, `resources/`, `prompts/`, `samples/`).
- **Roots** are not components, but dynamic context provided by the client/session. Use the helpers and types in `core/root.ts` for parsing and handling root URIs.

## Best Practices

- Use the functional API (`tool`, `resource`, `prompt`, `sample`) for all new components.
- Use Zod schemas for input validation and strong typing. These are automatically converted to JSON Schema for MCP compatibility.
- Keep business logic in your handler functions; use the API module for structure and type safety.
- Document your components for maintainability.

## Error Handling

Use the provided utilities for consistent error and response handling. Handler functions can throw errors, which will be formatted according to MCP standards.

## Dynamic Resource Templates

Resource templates are not included in the production release. For advanced dynamic resources, use the `getContent` function and parameter schemas in your resource definition.

## JWT Authentication Middleware

The DyneMCP API provides a ready-to-use JWT authentication middleware for Express-based servers, located at `auth/jwt-middleware.ts`.

### Features

- **Role-based access control:** Restrict endpoints to specific roles by passing an array of allowed roles.
- **Audience validation:** Strongly recommended in production. Prevents token passthrough and confused deputy attacks by ensuring the JWT `aud` claim matches your server.
- **Standard Express middleware:** Plug-and-play for any Express app.

### Usage

```ts
import jwtAuthMiddleware from '@dynemcp/dynemcp/auth/jwt-middleware'

// Basic usage (no role check, no audience check)
app.use(jwtAuthMiddleware())

// With allowed roles
app.use(jwtAuthMiddleware(['admin', 'user']))

// With allowed roles and audience validation (recommended for production)
app.use(
  jwtAuthMiddleware({
    allowedRoles: ['admin'],
    expectedAudience: 'my-mcp-server', // <-- set your audience string here
  })
)
```

- In production, if `expectedAudience` is not set, a warning will be printed to the console.
- The middleware sets `req.user` to the decoded JWT payload if valid.
- Responds with 401/403 on invalid, expired, or insufficient tokens.

### Security Best Practices

- **Always set `expectedAudience` in production** to prevent token passthrough attacks.
- Never forward client tokens to upstream APIs. Only accept tokens intended for your DyneMCP server.
- Use role-based checks to restrict sensitive endpoints.

### Example: Making an authenticated request

Generate a JWT token (for example, using [jwt.io](https://jwt.io/) or any JWT library) with your secret:

```sh
export JWT_SECRET=changeme
node -e "console.log(require('jsonwebtoken').sign({ user: 'alice', role: 'admin', aud: 'my-mcp-server' }, process.env.JWT_SECRET))"
```

Then, make a request to your DyneMCP server:

```sh
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{ "jsonrpc": "2.0", "method": "tools/list", "id": 1 }'
```

If the token is valid, you'll get a response. If not, you'll get a 401 Unauthorized error.

## MCP Autocompletion (completion) Support

DyneMCP supports the [MCP completion/autocompletion protocol](https://modelcontext.org/specification/2025-06-18/server/utilities/completion) for tools and prompts. This allows clients to request argument suggestions for tools and prompts, improving UX and reducing errors.

You can define a `complete` function in your tool or prompt definition. This function receives the argument name, the partial input, and an optional context, and returns an array of string suggestions (or a Promise).

#### Example: Tool with autocompletion

```ts
import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

export default tool(
  z.object({ fruit: z.string() }),
  async ({ fruit }) => ({ result: `You picked: ${fruit}` }),
  {
    name: 'fruit-picker',
    description: 'Pick a fruit',
    complete: async ({ argument, partialInput }) => {
      if (argument === 'fruit') {
        return ['apple', 'banana', 'orange'].filter((f) =>
          f.startsWith(partialInput)
        )
      }
      return []
    },
  }
)
```

#### Example: Prompt with autocompletion

```ts
import { prompt } from '@dynemcp/dynemcp'
import { z } from 'zod'

export default prompt({
  name: 'country-prompt',
  description: 'Prompt with country autocompletion',
  arguments: [{ name: 'country', description: 'Country name', required: true }],
  getMessages: async (args) => [
    {
      role: 'user',
      content: { type: 'text', text: `Country: ${args?.country}` },
    },
  ],
  complete: async ({ argument, partialInput }) => {
    if (argument === 'country') {
      return ['Argentina', 'Brazil', 'Canada', 'Denmark'].filter((c) =>
        c.toLowerCase().startsWith(partialInput.toLowerCase())
      )
    }
    return []
  },
})
```

- The framework and MCP SDK will automatically expose the completion endpoint if a `complete` function is present.
- The client can call the MCP method `completions/complete` to get suggestions for arguments.
- For resources, use resource templates or registry logic for completion (the SDK does not support `complete` directly on resources).

## MCP Pagination Support

DyneMCP implements [MCP-compliant pagination](https://modelcontext.org/specification/2025-06-18/server/utilities/pagination) for all standard list operations:

- `tools/list`
- `prompts/list`
- `resources/list`

All list operations support **cursor-based pagination** (opaque string, base64-encoded). The server determines the page size (default: 50). Each response includes a `nextCursor` field if more results exist. To fetch the next page, send the same method with the `cursor` param set to the last `nextCursor` value. If `nextCursor` is missing, you have reached the end of the results.

Helpers are available in `core/utils.ts` for custom pagination flows.

## MCP Progress Notifications Support

DyneMCP supports [MCP progress notifications](https://modelcontext.org/specification/2025-06-18/server/utilities/progress) for long-running operations in tools, prompts, and resources. Use the `sendProgressNotification` helper from `core/utils.ts` in your handler to send progress updates if the client requested them.

## MCP Request Cancellation Support

DyneMCP supports [MCP request cancellation](https://modelcontext.org/specification/2025-06-18/server/utilities/cancellation) for all long-running operations. Handler functions receive an `extra.signal` parameter (of type `AbortSignal`) and should check `extra.signal.aborted` or listen to the `abort` event for cleanup.

## ⚠️ Security Warning: Token Passthrough (Proxy) Attacks

**Never accept or forward tokens (e.g., Authorization headers) from clients to other upstream services or APIs.**

- Only accept tokens that are intended for your DyneMCP server (enforced by `expectedAudience`
