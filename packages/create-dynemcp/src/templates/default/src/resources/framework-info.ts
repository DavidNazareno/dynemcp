import { DyneMCPResource } from '@dynemcp/dynemcp'

export class FrameworkInfoResource extends DyneMCPResource {
  readonly uri = 'resource://default/framework-info'
  readonly name = 'framework-info'
  readonly description =
    'Information about the DyneMCP framework and its capabilities'
  readonly mimeType = 'text/markdown'

  getContent(): string {
    return `# DyneMCP Framework Information

## Overview
DyneMCP is a modern Model Context Protocol (MCP) framework designed for building intelligent, context-aware applications. This default template demonstrates the basic capabilities and patterns of the framework.

## Framework Features

### Core Components
- **Tools**: Executable functions that perform specific tasks
- **Resources**: Static or dynamic content that can be accessed
- **Prompts**: System messages that define agent behavior and context

### Development Patterns
- **Class-based Architecture**: Consistent OOP patterns for all components
- **Type Safety**: Full TypeScript support with proper type inference
- **Error Handling**: Built-in error management and validation
- **Extensibility**: Easy to extend and customize for specific needs

### Template Structure
\`\`\`
project/
├── src/
│   ├── index.ts          # Main server entry point
│   ├── tools/            # Tool implementations
│   ├── resources/        # Static and dynamic resources
│   └── prompt/           # System prompts
├── dynemcp.config.json   # Framework configuration
└── tsconfig.json         # TypeScript configuration
\`\`\`

## Available Templates

### Default Template (This)
- Basic greeting and math tools
- Framework information resource
- System context prompt
- Ideal for learning and simple use cases

### Calculator Template
- Advanced mathematical operations
- Expression evaluation
- Math reference documentation
- Perfect for computational tasks

### HTTP Server Template
- Web server capabilities
- Custom greeting with styles
- Server information resource
- Great for web-based applications

### Dynamic Agent Template
- Learning and adaptation capabilities
- Memory management
- Capability assessment
- Ideal for AI-powered applications

### Secure Agent Template
- Security-focused operations
- Authentication and authorization
- Audit logging
- Perfect for enterprise applications

## Getting Started

### Basic Usage
1. Install dependencies: \`npm install\`
2. Start development server: \`npm run dev\`
3. Build for production: \`npm run build\`

### Customization
- Modify tools in \`src/tools/\`
- Update resources in \`src/resources/\`
- Customize prompts in \`src/prompt/\`
- Configure settings in \`dynemcp.config.json\`

## Best Practices
- Use TypeScript for type safety
- Implement proper error handling
- Follow the class-based patterns
- Document your components well
- Test your implementations

## Support
- Documentation: Available in the framework docs
- Examples: See other templates for inspiration
- Community: Join the DyneMCP community for help

Framework version: Latest
Template version: 1.0.0
Last updated: ${new Date().toISOString()}`
  }
}

export default new FrameworkInfoResource()
