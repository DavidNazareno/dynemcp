import { resource } from '@dynemcp/dynemcp'

export default resource({
  uri: 'info://framework',
  name: 'Framework Information',
  description: 'Information about the DyneMCP framework',
  mimeType: 'text/markdown',
  getContent: () => `# DyneMCP Framework\n\n## Overview\nDyneMCP (Dynamic Model Context Protocol) is a TypeScript-first framework for building MCP servers with a focus on developer experience and type safety.\n\n## Key Features\n- 🚀 **TypeScript-first**: Full type safety and IntelliSense support\n- 📁 **File-based routing**: Organize your tools, resources, and prompts in folders\n- 🔧 **Zero configuration**: Works out of the box with sensible defaults\n- 🏗️ **Extensible**: Plugin system for custom functionality\n- 📖 **Rich documentation**: Comprehensive guides and API reference\n\n## Architecture\nDyneMCP follows a convention-over-configuration approach similar to Next.js:\n\n- `tools/` - Contains your MCP tools (functions the AI can call)\n- `resources/` - Contains your MCP resources (data the AI can read)\n- `prompts/` - Contains your MCP prompts (templates the AI can use)\n\n## Getting Started\n```bash\nnpx create-dynemcp my-mcp-server\ncd my-mcp-server\nnpm start\n```\n\n## Documentation\nVisit [dynemcp.dev](https://dynemcp.dev) for comprehensive documentation and examples.`,
})
