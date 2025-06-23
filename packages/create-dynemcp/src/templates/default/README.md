# DyneMCP Project

A Model Context Protocol (MCP) server built with DyneMCP, powered by NX.

## Project Structure

```
dynemcp-project/
│
├── tools/            → MCP tools (functions executable by AI)
│   └── tools.ts      → Central file registering tools
│
├── scripts/          → Build and utility scripts
│   └── build.js      → Script to build the MCP server using dynebuild
│
├── resources/        → Static or dynamic resources
│   └── resource.ts   → Central file registering resources
│
├── prompt/           → Base or transformable prompts
│   └── prompt.ts     → Central registry of prompts
│
├── src/              → Source code
│   └── index.ts      → Entry point
│
└── dynemcp.config.json → MCP server configuration
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

This project uses NX for efficient builds and dependency management. You can use NX commands directly:

```bash
# Run development server
nx serve

# Run linting
nx lint

# Run tests
nx test
```

## Building for Production

This project uses `dynebuild` to create a unified, minified bundle for production deployment:

```bash
pnpm run build
```

This command will:

1. Create a single optimized file at `dist/server.js`
2. Include all your code and dependencies in one bundle
3. Minify the output for better performance

After building, you can run your MCP server with:

```bash
pnpm start
# or
node dist/server.js
```

## Adding Tools, Resources, and Prompts

- Add tools in `tools/tools.ts`
- Add resources in `resources/resource.ts`
- Add prompts in `prompt/prompt.ts`

For more information, refer to the DyneMCP documentation.

## Definición de Tools, Resources y Prompts

Puedes definir tus tools, resources y prompts de varias formas. La forma recomendada es exportar un objeto tipado explícitamente:

### Tool como objeto (recomendado)

```ts
import { z } from 'zod'
import type { ToolDefinition } from '@dynemcp/dynemcp'

const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

const greeterTool: ToolDefinition = {
  name: 'greeter',
  description: 'A simple tool that greets the user',
  schema: GreeterSchema,
  handler: async ({ name }: { name: string }) => {
    return { message: `Hello, ${name}!` }
  },
}

export default greeterTool
```

### Tool como clase (opcional)

```ts
import { DyneMCPTool } from '@dynemcp/dynemcp'
import { z } from 'zod'

const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

export class GreeterTool extends DyneMCPTool {
  override get name() {
    return 'greeter'
  }
  override readonly description = 'A simple tool that greets the user'
  override readonly schema = GreeterSchema
  override async execute(input: { name: string }) {
    return { message: `Hello, ${input.name}!` }
  }
}

export default GreeterTool
```

### Tool como instancia de clase (opcional)

```ts
export default new GreeterTool()
```

### Resources y Prompts

Puedes usar el mismo patrón para resources y prompts, exportando objetos o clases que extiendan DyneMCPResource o DyneMCPPrompt.

**Recomendación:** Usa el patrón de objeto tipado (por ejemplo, `ResourceDefinition`, `PromptDefinition`) para mayor claridad y compatibilidad.
