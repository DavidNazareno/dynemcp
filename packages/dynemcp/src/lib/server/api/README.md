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

### Example: Using the middleware directly

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

- `expectedAudience` enforces that the JWT `aud` claim matches the expected value. This is a critical security measure to prevent token passthrough and confused deputy attacks.
- In production, if `expectedAudience` is not set, a warning will be printed to the console.

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

## MCP Autocompletion (completion) Support

DyneMCP supports the [MCP completion/autocompletion protocol](https://modelcontext.org/specification/2025-06-18/server/utilities/completion) for tools and prompts. This allows clients to request argument suggestions for tools and prompts, improving UX and reducing errors.

### How to use

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

### How it works

- All list operations support **cursor-based pagination** (opaque string, base64-encoded).
- The server determines the page size (default: 50).
- Each response includes a `nextCursor` field if more results exist.
- To fetch the next page, send the same method with the `cursor` param set to the last `nextCursor` value.
- If `nextCursor` is missing, you have reached the end of the results.

### Example: Paginated MCP request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": { "cursor": "eyJwYWdlIjogMn0=" }
}
```

### Example: Paginated MCP response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [ ... ],
    "nextCursor": "eyJwYWdlIjogM30="
  }
}
```

### Notes for framework users

- **No extra work required:** All MCP clients (and your own API consumers) get pagination automatically.
- **Helpers available:** You can use the registry's `getPaginatedTools`, `getPaginatedPrompts`, and `getPaginatedResources` in your own code for custom flows.
- **Interoperability:** Any MCP-compliant client will work out of the box with paginated results.

See the [MCP Pagination Spec](https://modelcontext.org/specification/2025-06-18/server/utilities/pagination) for protocol details.

## MCP Progress Notifications Support

DyneMCP supports [MCP progress notifications](https://modelcontext.org/specification/2025-06-18/server/utilities/progress) for long-running operations in tools, prompts, and resources.

- If the client includes a `progressToken` in the request (`_meta.progressToken`), you can send progress updates using the provided helper.
- The helper will send a `notifications/progress` message to the client, following the MCP protocol.

### How to use

Import and use the `sendProgressNotification` helper in your handler:

```ts
import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'
import { sendProgressNotification } from '@dynemcp/dynemcp/server/api/core/utils'

export default tool(
  z.object({ count: z.number() }),
  async ({ count }, extra) => {
    for (let i = 0; i <= count; i++) {
      await sendProgressNotification(extra, {
        progress: i,
        total: count,
        message: `Processed ${i} of ${count}`,
      })
      await new Promise((r) => setTimeout(r, 100)) // Simulate work
    }
    return { result: `Done!` }
  },
  {
    name: 'long-task',
    description: 'A tool that demonstrates progress notifications',
  }
)
```

- The helper will only send notifications if the client requested progress.
- You can use the same helper in prompts and resources.
- See the [MCP Progress Spec](https://modelcontext.org/specification/2025-06-18/server/utilities/progress) for protocol details.

## MCP Request Cancellation Support

DyneMCP supports [MCP request cancellation](https://modelcontext.org/specification/2025-06-18/server/utilities/cancellation) for all long-running operations.

- If the client sends a `notifications/cancelled` notification with a `requestId`, the SDK MCP will abort the corresponding handler using an `AbortSignal`.
- All handler functions (tools, prompts, resources) receive an `extra.signal` parameter (of type `AbortSignal`).
- You should check `extra.signal.aborted` periodically and abort your work if it is true.
- You can also listen to the `abort` event for cleanup.

### How to use

```ts
import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

export default tool(
  z.object({ count: z.number() }),
  async ({ count }, extra) => {
    for (let i = 0; i <= count; i++) {
      if (extra.signal.aborted) {
        // Cleanup, log, etc.
        throw new Error('Request cancelled by client')
      }
      await new Promise((r) => setTimeout(r, 100))
    }
    return { result: `Done!` }
  }
)
```

Or using the event:

```ts
extra.signal.addEventListener('abort', () => {
  // Cleanup, log, etc.
})
```

- You do **not** need to register a handler for `notifications/cancelled`: the SDK handles it for you.
- If the request is already completed, cancellation is ignored (as per MCP spec).
- See the [MCP Cancellation Spec](https://modelcontext.org/specification/2025-06-18/server/utilities/cancellation) for protocol details.

## ⚠️ Security Warning: Token Passthrough (Proxy) Attacks

**Never accept or forward tokens (e.g., Authorization headers) from clients to other upstream services or APIs.**

- Only accept tokens that are intended for your DyneMCP server (enforced by `expectedAudience` in the JWT middleware).
- Never use the same Authorization header or token received from a client to authenticate requests to other services (such as LLM APIs, OAuth providers, or other MCP servers).
- This prevents token passthrough and confused deputy attacks, where a malicious client could trick your server into using their token for unintended access.

### ❌ Insecure Pattern (Do NOT do this)

```ts
// BAD: Forwarding client token to an upstream API
const clientToken = req.headers.authorization
fetch('https://api.upstream.com', {
  headers: { Authorization: clientToken },
})
```

### ✅ Secure Pattern

```ts
// Only use your own service credentials for upstream APIs
fetch('https://api.upstream.com', {
  headers: { Authorization: `Bearer ${process.env.UPSTREAM_API_KEY}` },
})
```

- The DyneMCP JWT middleware, with `expectedAudience`, helps prevent this by rejecting tokens not meant for your server.

## License

MIT
