# DyneMCP Default Template

This is the default template for DyneMCP projects, featuring a file-based architecture similar to Next.js.

## 🏗️ Project Structure

```
src/
├── index.ts                    # Server entry point
├── tools/                      # Tools directory
│   ├── greeter/               # Greeter tool folder
│   │   └── tool.ts           # Main tool file (loaded automatically)
│   └── math/                  # Math tool folder
│       ├── tool.ts           # Main tool file (loaded automatically)
│       └── utils.ts          # Helper utilities (NOT loaded automatically)
├── resources/                  # Resources directory
│   ├── framework-info/        # Framework info resource folder
│   │   └── resource.ts       # Main resource file (loaded automatically)
│   └── user-data/            # User data resource folder
│       └── resource.ts       # Main resource file (loaded automatically)
└── prompts/                    # Prompts directory
    ├── system-context/        # System context prompt folder
    │   └── prompt.ts         # Main prompt file (loaded automatically)
    └── conversation/          # Conversation prompt folder
        └── prompt.ts         # Main prompt file (loaded automatically)
```

## 🔑 Key Architecture Concepts

### File-Based Auto-Loading

DyneMCP follows a convention-over-configuration approach:

- **Tools**: Only files named `tool.ts` or `tool.js` are automatically loaded as tools
- **Resources**: Only files named `resource.ts` or `resource.js` are automatically loaded as resources
- **Prompts**: Only files named `prompt.ts` or `prompt.js` are automatically loaded as prompts

### Helper Files and Utilities

You can include any number of helper files in component folders:

```
tools/
  math/
    tool.ts        # ✅ Loaded automatically as a tool
    utils.ts       # ✅ Available for import but NOT loaded as a tool
    constants.ts   # ✅ Available for import but NOT loaded as a tool
    calculations/  # ✅ Subfolder with more utilities
      advanced.ts  # ✅ Available for import but NOT loaded as a tool
```

### Benefits

- **Clean Organization**: Each component has its own folder with utilities
- **No Accidental Loading**: Only specific files are loaded as components
- **Scalable**: Add as many helper files as needed without affecting auto-loading
- **Type Safety**: Full TypeScript support with proper imports

## 🛠️ Available Components

### Tools

- **greeter**: Simple greeting tool (`tools/greeter/tool.ts`)
- **math**: Advanced mathematical operations with utilities (`tools/math/tool.ts`)

### Resources

- **framework-info**: Information about the DyneMCP framework (`resources/framework-info/resource.ts`)
- **user-data**: User preferences and session data (`resources/user-data/resource.ts`)

### Prompts

- **system-context**: System instructions for the AI (`prompts/system-context/prompt.ts`)
- **conversation**: Conversation starter template (`prompts/conversation/prompt.ts`)

## 🚀 Getting Started

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start development server**:

   ```bash
   pnpm dev
   ```

3. **Build for production**:
   ```bash
   pnpm build
   ```

## 📝 Creating New Components

### Adding a New Tool

```bash
# Create folder and main tool file
mkdir src/tools/my-tool
touch src/tools/my-tool/tool.ts
```

```typescript
// src/tools/my-tool/tool.ts
import { DyneMCPTool, CallToolResult } from '@dynemcp/dynemcp'
import { z } from 'zod'

const MyToolSchema = z.object({
  input: z.string().describe('Input parameter'),
})

export class MyTool extends DyneMCPTool {
  readonly name = 'my-tool'
  readonly description = 'Description of my tool'
  readonly inputSchema = MyToolSchema.shape

  execute(input: z.infer<typeof MyToolSchema>): CallToolResult {
    return {
      content: [{ type: 'text', text: `Processed: ${input.input}` }],
    }
  }
}

export default new MyTool()
```

### Adding Helper Utilities

```typescript
// src/tools/my-tool/utils.ts (NOT auto-loaded)
export function helperFunction(data: string): string {
  return data.toUpperCase()
}
```

Then import in your tool:

```typescript
// src/tools/my-tool/tool.ts
import { helperFunction } from './utils.js'
```

### Adding a New Resource

```bash
mkdir src/resources/my-resource
touch src/resources/my-resource/resource.ts
```

### Adding a New Prompt

```bash
mkdir src/prompts/my-prompt
touch src/prompts/my-prompt/prompt.ts
```

## 🔧 Configuration

The project uses `dynemcp.config.json` for configuration:

```json
{
  "name": "default-template",
  "version": "1.0.0",
  "description": "Default DyneMCP template with file-based architecture",
  "autoload": {
    "tools": {
      "enabled": true,
      "directory": "src/tools"
    },
    "resources": {
      "enabled": true,
      "directory": "src/resources"
    },
    "prompts": {
      "enabled": true,
      "directory": "src/prompts"
    }
  }
}
```

## 📚 Learn More

- [DyneMCP Documentation](https://dynemcp.dev)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Follow the file-based architecture patterns
2. Use TypeScript for type safety
3. Include helper utilities in component folders
4. Test your components thoroughly
5. Update documentation as needed

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
