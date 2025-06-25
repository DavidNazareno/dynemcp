# @dynemcp/create-dynemcp

[![npm version](https://badge.fury.io/js/@dynemcp%2Fcreate-dynemcp.svg)](https://badge.fury.io/js/@dynemcp%2Fcreate-dynemcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> CLI for creating new DyneMCP projects with pre-configured templates

The official project generator for DyneMCP - quickly scaffold new Model Context Protocol (MCP) servers with best practices and modern tooling built-in.

## 🚀 Features

- 🎯 **Interactive CLI**: Guided project creation with prompts
- 📋 **Multiple Templates**: Choose from specialized templates for different use cases
- 📦 **Zero Configuration**: Projects work out of the box
- 🔧 **Modern Tooling**: TypeScript, ESBuild, and hot reload included
- 🌐 **Transport Options**: Support for stdio, HTTP, and streaming transports
- 🛡️ **Security Ready**: Templates with authentication and security features
- 📚 **Documentation**: Each template includes comprehensive guides

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @dynemcp/create-dynemcp
```

### Using npx (No Installation)

```bash
npx @dynemcp/create-dynemcp my-project
```

### Other Package Managers

```bash
# With pnpm
pnpm dlx @dynemcp/create-dynemcp my-project

# With yarn
yarn create @dynemcp/create-dynemcp my-project
```

## 🚀 Quick Start

### Interactive Mode

```bash
create-dynemcp my-agent
```

This will prompt you to:

1. Choose a template
2. Confirm project name
3. Install dependencies

### Non-Interactive Mode

```bash
# Use default template
create-dynemcp my-agent --yes

# Specify template
create-dynemcp my-calculator --template calculator --yes

# Skip dependency installation
create-dynemcp my-agent --template secure-agent --yes --skip-install
```

## 🏗️ Available Templates

### Default Template

**Use case**: Learning MCP basics, simple automation tasks

```bash
create-dynemcp my-project --template default
```

**What you get**:

- Basic MCP server setup with stdio transport
- Example tool for text manipulation
- Sample resource with static content
- Simple prompt for AI assistance
- TypeScript configuration
- Build scripts and hot reload

**Perfect for**:

- First-time MCP developers
- Prototyping new ideas
- Educational purposes

---

### Calculator Template

**Use case**: Mathematical computations, educational tools

```bash
create-dynemcp my-calculator --template calculator
```

**What you get**:

- Basic arithmetic operations (add, subtract, multiply, divide)
- Advanced mathematical functions (trigonometry, logarithms)
- Mathematical constants and formulas resource
- Specialized prompts for mathematical problem solving
- Error handling for mathematical edge cases

**Perfect for**:

- Educational math tools
- Scientific calculations
- Engineering applications
- Math tutoring systems

---

### HTTP Server Template

**Use case**: Web integration, API endpoints

```bash
create-dynemcp my-server --template http-server
```

**What you get**:

- Express.js HTTP server setup
- RESTful endpoint configuration
- CORS middleware
- HTTP transport for MCP
- Basic greeting and server info tools
- Health check endpoints

**Perfect for**:

- Web application integration
- REST API development
- Microservices architecture
- Browser-based clients

---

### Secure Agent Template

**Use case**: Enterprise applications, production environments

```bash
create-dynemcp my-secure-agent --template secure-agent
```

**What you get**:

- API key authentication middleware
- Streamable HTTP transport with sessions
- Rate limiting and CORS configuration
- Security headers and input validation
- Audit logging capabilities
- Production-ready configuration

**Perfect for**:

- Enterprise applications
- Production deployments
- Multi-tenant systems
- Regulated environments

---

### Dynamic Agent Template

**Use case**: AI research, adaptive systems

```bash
create-dynemcp my-dynamic-agent --template dynamic-agent
```

**What you get**:

- Dynamic tool registration system
- Model sampling capabilities
- Memory persistence and learning
- Adaptive behavior patterns
- Experimental AI features

**Perfect for**:

- AI research projects
- Self-learning systems
- Adaptive automation
- Experimental applications

## 🔧 CLI Options

### Command Syntax

```bash
create-dynemcp [directory] [options]
```

### Available Options

| Option              | Alias | Description                    | Default   |
| ------------------- | ----- | ------------------------------ | --------- |
| `--template <name>` | `-t`  | Template to use                | `default` |
| `--skip-install`    |       | Skip dependency installation   | `false`   |
| `--yes`             | `-y`  | Skip all prompts, use defaults | `false`   |
| `--version`         | `-v`  | Show version number            |           |
| `--help`            | `-h`  | Show help message              |           |

### Examples

```bash
# Interactive mode with template selection
create-dynemcp my-project

# Specific template, interactive
create-dynemcp my-calculator --template calculator

# Completely non-interactive
create-dynemcp my-agent --template secure-agent --yes --skip-install

# Show available options
create-dynemcp --help
```

## 📁 Generated Project Structure

After running the generator, you'll get a project structure like this:

```
my-project/
├── src/
│   ├── index.ts              # Main entry point
│   ├── tools/                # MCP tools directory
│   │   └── *.ts              # Tool implementations
│   ├── resources/            # MCP resources directory
│   │   └── *.ts              # Resource definitions
│   └── prompts/              # MCP prompts directory
│       └── *.ts              # Prompt definitions
├── dynemcp.config.json       # DyneMCP configuration
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

### Configuration Files

Each generated project includes:

- **`dynemcp.config.json`**: Main configuration for server behavior
- **`package.json`**: Dependencies and scripts
- **`tsconfig.json`**: TypeScript compiler settings
- **`README.md`**: Project-specific documentation

## 🏃‍♂️ Post-Generation Workflow

After creating your project:

1. **Navigate to the project directory**:

   ```bash
   cd my-project
   ```

2. **Install dependencies** (if skipped):

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Build for production**:

   ```bash
   npm run build
   ```

5. **Test your server**:
   ```bash
   npm test
   ```

## 🎨 Customizing Templates

### Modifying Generated Projects

After generation, you can customize your project by:

1. **Adding new tools**: Create files in `src/tools/`
2. **Adding resources**: Create files in `src/resources/`
3. **Adding prompts**: Create files in `src/prompts/`
4. **Updating configuration**: Edit `dynemcp.config.json`

### Example: Adding a New Tool

```typescript
// src/tools/my-custom-tool.ts
import { z } from 'zod'
import { ToolDefinition } from '@dynemcp/dynemcp'

const MyToolSchema = z.object({
  input: z.string().describe('Input for processing'),
})

const myCustomTool: ToolDefinition = {
  name: 'my-custom-tool',
  description: 'Does something amazing',
  schema: MyToolSchema,
  handler: async ({ input }) => {
    return { result: `Processed: ${input}` }
  },
}

export default myCustomTool
```

## 🔍 Template Details

### Template Comparison

| Template      | Transport       | Authentication | Use Case              | Complexity |
| ------------- | --------------- | -------------- | --------------------- | ---------- |
| Default       | stdio           | None           | Learning, prototyping | ⭐         |
| Calculator    | stdio           | None           | Math operations       | ⭐⭐       |
| HTTP Server   | HTTP            | None           | Web integration       | ⭐⭐       |
| Secure Agent  | Streamable HTTP | API Key        | Production apps       | ⭐⭐⭐     |
| Dynamic Agent | stdio           | None           | AI research           | ⭐⭐⭐⭐   |

### Template Features Matrix

| Feature           | Default | Calculator | HTTP Server | Secure Agent | Dynamic Agent |
| ----------------- | ------- | ---------- | ----------- | ------------ | ------------- |
| Basic Tools       | ✅      | ✅         | ✅          | ✅           | ✅            |
| Math Tools        | ❌      | ✅         | ❌          | ❌           | ❌            |
| HTTP Transport    | ❌      | ❌         | ✅          | ✅           | ❌            |
| Authentication    | ❌      | ❌         | ❌          | ✅           | ❌            |
| Dynamic Registry  | ❌      | ❌         | ❌          | ❌           | ✅            |
| Model Sampling    | ❌      | ❌         | ❌          | ❌           | ✅            |
| Security Features | ❌      | ❌         | ⚠️          | ✅           | ❌            |

## 🛠️ Development

### Setting Up for Development

```bash
# Clone the repository
git clone https://github.com/dynemcp/dynemcp.git
cd dynemcp

# Install dependencies
pnpm install

# Build the create-dynemcp package
pnpm nx build @dynemcp/create-dynemcp

# Test the CLI locally
node packages/create-dynemcp/dist/index.js my-test-project
```

### Testing Templates

```bash
# Test a specific template
./scripts/test-template.sh calculator

# Test all templates
./scripts/test-template.sh
```

### Adding New Templates

1. Create a new directory in `src/templates/`
2. Add the template files and configuration
3. Update the template list in `src/lib/create-dynemcp.ts`
4. Add tests for the new template

## 📚 API Reference

### Main Function

```typescript
async function createProject(
  projectPath: string,
  projectName: string,
  template: string
): Promise<void>
```

### Template Validation

```typescript
function validateProjectName(name: string): {
  valid: boolean
  problems?: string[]
}
```

### Available Templates

```typescript
const AVAILABLE_TEMPLATES = [
  'default',
  'calculator',
  'http-server',
  'secure-agent',
  'dynamic-agent',
] as const
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Testing Generated Projects

Each template generates a project with its own test suite:

```bash
# After creating a project
cd my-project
npm test
```

## 🚀 Deployment

### Publishing Updates

```bash
# Version bump
npm version patch|minor|major

# Build and publish
npm run build
npm publish
```

### CI/CD Integration

The package includes GitHub Actions workflows for:

- Automated testing
- Version management
- NPM publishing
- Template validation

## 🐛 Troubleshooting

### Common Issues

**Error: "Invalid project name"**

```bash
# Use kebab-case for project names
create-dynemcp my-project-name  # ✅ Good
create-dynemcp MyProject        # ❌ Avoid
```

**Error: "Template not found"**

```bash
# Check available templates
create-dynemcp --help

# Use exact template names
create-dynemcp my-project --template calculator  # ✅ Good
create-dynemcp my-project --template calc        # ❌ Won't work
```

**Error: "Permission denied"**

```bash
# Fix npm permissions or use npx
npx @dynemcp/create-dynemcp my-project
```

### Getting Help

- 📖 [Documentation](https://dynemcp.dev)
- 🐛 [Report Issues](https://github.com/dynemcp/dynemcp/issues)
- 💬 [Discussions](https://github.com/dynemcp/dynemcp/discussions)
- 📧 [Email Support](mailto:support@dynemcp.dev)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-template`)
3. Add your template or improvements
4. Add tests for your changes
5. Commit your changes (`git commit -m 'Add amazing template'`)
6. Push to the branch (`git push origin feature/amazing-template`)
7. Open a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Add comprehensive tests for new templates
- Update documentation for any new features
- Ensure all templates work with the latest DyneMCP version

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🔗 Links

- [DyneMCP Framework](https://github.com/dynemcp/dynemcp)
- [MCP Specification](https://modelcontextprotocol.io/)
- [npm Package](https://www.npmjs.com/package/@dynemcp/create-dynemcp)
- [Documentation](https://dynemcp.dev/create-dynemcp)
