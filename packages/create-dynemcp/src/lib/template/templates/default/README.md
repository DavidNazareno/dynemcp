# DyneMCP Default Template

This is the official default template for DyneMCP projects. It provides a clean, scalable, and type-safe starting point for building Model Context Protocol (MCP) servers using a file-based architecture inspired by frameworks like Next.js.

## 🚀 Features

- **File-based auto-loading** for tools, resources, and prompts
- **TypeScript-first**: full type safety and IntelliSense
- **Extensible**: add your own tools, resources, and prompts easily
- **Helper utilities**: organize helpers alongside components without accidental auto-loading
- **Ready for LLM completions**: includes a sample for LLM integration

## 🏗️ Project Structure

```
src/
├── index.ts                    # Server entry point
├── tools/                      # Tools directory
│   ├── greeter/               # Greeter tool folder
│   │   └── tool.ts           # Main tool file (auto-loaded)
│   └── math/                  # Math tool folder
│       ├── tool.ts           # Main tool file (auto-loaded)
│       └── utils.ts          # Helper utilities (NOT auto-loaded)
├── resources/                  # Resources directory
│   ├── framework-info/        # Framework info resource folder
│   │   └── resource.ts       # Main resource file (auto-loaded)
│   └── user-data/            # User data resource folder
│       └── resource.ts       # Main resource file (auto-loaded)
├── prompts/                    # Prompts directory
│   ├── system-context/        # System context prompt folder
│   │   └── prompt.ts         # Main prompt file (auto-loaded)
│   └── conversation/          # Conversation prompt folder
│       └── prompt.ts         # Main prompt file (auto-loaded)
├── samples/                    # LLM sample directory
│   └── hello-sample/         # Example LLM completion sample
│       └── sample.ts         # Main sample file
└── roots/                      # Roots helpers and examples
    └── roots.ts              # Example and helpers for roots
```

## 🔑 Conventions

- **Tools**: Only files named `tool.ts` or `tool.js` in `src/tools/**/` are auto-loaded as tools.
- **Resources**: Only files named `resource.ts` or `resource.js` in `src/resources/**/` are auto-loaded as resources.
- **Prompts**: Only files named `prompt.ts` or `prompt.js` in `src/prompts/**/` are auto-loaded as prompts.
- **Helpers**: Any other files (e.g., `utils.ts`) are ignored by the loader and can be freely used for utilities.

## 🛠️ Example: Creating a Tool

```typescript
// src/tools/my-tool/tool.ts
import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

// --- Schema (Arguments) --- //
const MyToolSchema = z.object({
  input: z.string().describe('Input parameter'),
})

// --- Logic --- //
function processInput(input: string) {
  return input.toUpperCase()
}

// --- Export --- //
export default tool(
  MyToolSchema,
  async ({ input }) => ({
    content: [{ type: 'text', text: `Processed: ${processInput(input)}` }],
  }),
  {
    name: 'my-tool',
    description: 'Processes the input string',
  }
)
```

## 🛠️ Example: Creating a Resource

```typescript
// src/resources/my-resource/resource.ts
import { resource } from '@dynemcp/dynemcp'

function getMyResource() {
  return JSON.stringify({ message: 'Hello from my resource!' })
}

export default resource({
  uri: 'resource://my-resource',
  name: 'my-resource',
  description: 'A sample resource',
  mimeType: 'application/json',
  getContent: getMyResource,
})
```

## 🛠️ Example: Creating a Prompt

```typescript
// src/prompts/my-prompt/prompt.ts
import { prompt } from '@dynemcp/dynemcp'

const MyPromptArguments = [
  { name: 'topic', description: 'The topic to discuss', required: true },
]

async function getMessages(args: Record<string, any> = {}) {
  return [
    {
      role: 'user',
      content: { type: 'text', text: `Let's talk about ${args.topic}` },
    },
  ]
}

export default prompt({
  name: 'my-prompt',
  description: 'A simple prompt example',
  arguments: MyPromptArguments,
  getMessages,
})
```

## 🧩 Extending the Template

- Add new tools, resources, or prompts by following the folder/file conventions above.
- Use helper files for shared logic or utilities.
- See the included examples for best practices on code organization and comments.

## 📚 Learn More

- [DyneMCP Documentation](https://dynemcp.dev)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

- Follow the file-based architecture patterns
- Use TypeScript for type safety
- Include helper utilities in component folders
- Test your components thoroughly
- Update documentation as needed

## Object-Based Tool Definition Example

DyneMCP supports two formats for defining tools:

### 1. Class-Based (Working)

```typescript
export class MyTool extends DyneMCPTool {
  readonly name = 'my_tool'
  readonly description = 'Description'
  readonly inputSchema = MySchema.shape

  execute(input: any): CallToolResult {
    return { content: [{ type: 'text', text: 'result' }] }
  }
}
export default new MyTool()
```

### 2. Object-Based (Fixed with v0.0.19-canary.20250626T15430+)

```typescript
import { ToolDefinition } from '@dynemcp/dynemcp'
import { z } from 'zod'

const MySchema = z.object({
  value: z.number().describe('A number'),
})

const myTool: ToolDefinition = {
  name: 'my_tool',
  description: 'Description',
  inputSchema: MySchema.shape, // ZodRawShape automatically converted to ZodObject
  execute: async (args) => {
    return { content: [{ type: 'text', text: 'result' }] }
  },
}
export default myTool
```

## Fix for keyValidator.\_parse Error

The `keyValidator._parse is not a function` error has been fixed in the latest version. The framework now:

1. Detects when `inputSchema` is a `ZodRawShape`
2. Automatically converts it to a `ZodObject` (which has the `_parse` method)
3. Passes the proper Zod object to the MCP SDK

This means both class-based and object-based tool definitions work seamlessly.

## 🧪 Creating and Running Samples (LLM Sampling)

A **sample** is a request for an LLM completion (sampling) that you can define as a TypeScript file exporting a `SamplingRequest` object.

### How to create a sample

1. Create a file in `src/samples/` (e.g., `src/samples/hello-world.ts`).
2. Export an object of type `SamplingRequest`:

```ts
import type { SamplingRequest } from '@dynemcp/dynemcp'

const helloWorld: SamplingRequest = {
  messages: [{ role: 'user', content: { type: 'text', text: 'Say hello!' } }],
  maxTokens: 50,
}

export default helloWorld
```

### How to run a sample

Import the object and use the `sample` helper from the framework:

```ts
import helloWorld from './samples/hello-world'
import { sample } from '@dynemcp/dynemcp'

const result = await sample(helloWorld)
console.log(result.content.text)
```

- You do **not** need to register or autoload samples.
- You can run samples from tools, endpoints, tests, or internal logic.

#### Example: Integrating a sample in a tool

```ts
import { z } from 'zod'
import { sample } from '@dynemcp/dynemcp'
import helloWorld from '../samples/hello-world'

export default {
  name: 'run-hello-sample',
  description: 'Runs the hello-world sample',
  inputSchema: z.object({}),
  async execute(_, context) {
    return await sample(helloWorld)
  },
}
```

## 🧩 Dynamic Resource Templates

// TODO: Resource template documentation removed for production release. Re-implement in a future version if needed.

## 🔒 Authentication Middleware (JWT)

This template includes a ready-to-use JWT authentication middleware in `src/middleware.ts`.

- The server will refuse to start in production if you do not create `src/middleware.ts`.
- In development, all requests are allowed by default, but a warning will be logged.

### How to use

1. The middleware is already included in the template at `src/middleware.ts` and uses the framework's JWT middleware by default.
2. You can customize `src/middleware.ts` to add your own logic (roles, claims, etc.).
3. Set your JWT secret in the environment variable `JWT_SECRET`.

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
