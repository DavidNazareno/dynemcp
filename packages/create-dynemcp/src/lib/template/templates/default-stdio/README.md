# DyneMCP Default STDIO Template

This is the official STDIO template for DyneMCP projects. It provides a clean, scalable, and type-safe starting point for building Model Context Protocol (MCP) servers using a file-based architecture inspired by frameworks like Next.js.

## 🚀 Features

- **File-based auto-loading** for tools, resources, prompts, and roots
- **TypeScript-first**: full type safety and IntelliSense
- **Extensible**: add your own tools, resources, and prompts easily
- **JWT authentication**: ready-to-use middleware for secure endpoints
- **LLM sample integration**: includes a sample for LLM completions

## 🏗️ Project Structure

```
src/
├── index.ts                    # Server entry point
├── middleware.ts               # JWT authentication middleware
├── tools/                      # Tools directory
│   └── greeter/                # Greeter tool folder
│       └── tool.ts             # Main tool file (auto-loaded)
├── resources/                  # Resources directory
│   └── framework-info/         # Framework info resource folder
│       └── resource.ts         # Main resource file (auto-loaded)
├── prompts/                    # Prompts directory
│   └── system-context/         # System context prompt folder
│       └── prompt.ts           # Main prompt file (auto-loaded)
└──
```

## 🔑 Conventions

- **Tools**: Only files named `tool.ts` or `tool.js` in `src/tools/**/` are auto-loaded as tools.
- **Resources**: Only files named `resource.ts` or `resource.js` in `src/resources/**/` are auto-loaded as resources.
- **Prompts**: Only files named `prompt.ts` or `prompt.js` in `src/prompts/**/` are auto-loaded as prompts.
- **Helpers**: Any other files (e.g., `utils.ts`) are ignored by the loader and can be freely used for utilities.

## ⚙️ Configuration

The main configuration file is `dynemcp.config.ts` at the project root. Example:

```ts
export default {
  server: {
    name: 'dynemcp-stdio-project',
    version: '1.0.0',
  },
  tools: {
    enabled: true,
    directory: './src/tools',
    pattern: '**/*.{ts,js}',
  },
  resources: {
    enabled: true,
    directory: './src/resources',
    pattern: '**/*.{ts,js}',
  },
  prompts: {
    enabled: true,
    directory: './src/prompts',
    pattern: '**/*.{ts,js}',
  },
  transport: {
    type: 'stdio',
  },
}
```

## 🛠️ Example: Creating a Tool

```typescript
// src/tools/greeter/tool.ts
import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'

const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
  image: z.string().url().optional().describe('Optional image URL'),
})

export default tool(
  GreeterSchema,
  async ({ name, image }) => {
    if (!name?.trim()) return 'Name cannot be empty'
    if (!image) return `Hello, ${name}!`
    return [
      `Hello, ${name}!`,
      { type: 'image', url: image, alt: `Avatar for ${name}` },
    ]
  },
  {
    name: 'greeter',
    description: 'A simple tool that greets the user and can return an image',
  }
)
```

## 📦 Example: Creating a Resource

```typescript
// src/resources/framework-info/resource.ts
import { resource } from '@dynemcp/dynemcp'

function getFrameworkInfo() {
  return `# DyneMCP Framework\n\nThis is a TypeScript-first framework for building MCP servers.`
}

export default resource({
  uri: 'info://framework',
  name: 'Framework Information',
  description: 'Information about the DyneMCP framework',
  mimeType: 'text/markdown',
  getContent: getFrameworkInfo,
})
```

## 💬 Example: Creating a Prompt

```typescript
// src/prompts/system-context/prompt.ts
import { prompt as systemPrompt } from '@dynemcp/dynemcp'

const SystemContextArguments = [
  { name: 'user_role', description: 'The role of the user', required: false },
  {
    name: 'task_context',
    description: 'The current task or context',
    required: false,
  },
]

async function getMessages(args = {}) {
  const userRole = args.user_role || 'user'
  const taskContext = args.task_context || 'general assistance'
  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `You are an AI assistant for the DyneMCP framework.\nCurrent context: ${taskContext}`,
      },
    },
  ]
}

export default systemPrompt({
  name: 'system_context',
  description: 'Provides system context and instructions for the AI assistant',
  arguments: SystemContextArguments,
  getMessages,
})
```


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
