import { DyneMCPResource } from '@dynemcp/dynemcp'

export class FrameworkInfoResource extends DyneMCPResource {
  readonly uri = 'info://framework'
  readonly name = 'Framework Information'
  readonly description = 'Information about the DyneMCP framework'
  readonly mimeType = 'text/markdown'

  getContent(): string {
    return `# DyneMCP Framework

## Overview
DyneMCP (Dynamic Model Context Protocol) is a TypeScript-first framework for building MCP servers with a focus on developer experience and type safety.

## Key Features
- 🚀 **TypeScript-first**: Full type safety and IntelliSense support
- 📁 **File-based routing**: Organize your tools, resources, and prompts in folders
- 🔧 **Zero configuration**: Works out of the box with sensible defaults
- 🏗️ **Extensible**: Plugin system for custom functionality
- 📖 **Rich documentation**: Comprehensive guides and API reference

## Architecture
DyneMCP follows a convention-over-configuration approach similar to Next.js:

- \`tools/\` - Contains your MCP tools (functions the AI can call)
- \`resources/\` - Contains your MCP resources (data the AI can read)
- \`prompts/\` - Contains your MCP prompts (templates the AI can use)

## Getting Started
\`\`\`bash
npx create-dynemcp my-mcp-server
cd my-mcp-server
npm start
\`\`\`

## Documentation
Visit [dynemcp.dev](https://dynemcp.dev) for comprehensive documentation and examples.
`
  }
}

export default new FrameworkInfoResource()
