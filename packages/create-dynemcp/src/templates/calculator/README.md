# Calculator MCP Server

A Model Context Protocol (MCP) server with advanced mathematical calculation tools.

## Project Structure

```
calculator-mcp-server/
├── src/
│   ├── tools/              # MCP tools (mathematical functions)
│   │   ├── basic-calculator.ts
│   │   └── advanced-calculator.ts
│   ├── resources/          # Mathematical reference materials
│   │   └── math-reference.ts
│   ├── prompts/            # System prompts
│   │   └── calculator-prompt.ts
│   └── index.ts            # Entry point
├── dynemcp.config.json     # MCP server configuration
├── package.json            # Project dependencies (auto-generated)
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Available Tools

### Basic Calculator
- **basic-calculator**: Perform basic arithmetic operations
  - Operations: add, subtract, multiply, divide
  - Input: two numbers and an operation
  - Example: "Calculate 15 + 27"

### Advanced Calculator
- **advanced-calculator**: Perform advanced mathematical operations
  - Operations: power, sqrt, log, sin, cos, tan
  - Input: a number and an operation (plus optional parameters)
  - Examples: "Calculate √16", "Calculate 2^10", "Calculate sin(π/2)"

## Available Resources

- **Mathematics Reference**: Comprehensive guide to mathematical operations and formulas

## Available Prompts

- **calculator**: Specialized prompt for mathematical assistance

## Example Usage

### Basic Operations
```typescript
// Addition
basic-calculator: { operation: "add", a: 15, b: 27 }
// Result: { result: 42, operation: "15 + 27 = 42" }

// Multiplication
basic-calculator: { operation: "multiply", a: 6, b: 7 }
// Result: { result: 42, operation: "6 × 7 = 42" }
```

### Advanced Operations
```typescript
// Square root
advanced-calculator: { operation: "sqrt", value: 144 }
// Result: { result: 12, operation: "√144 = 12" }

// Power
advanced-calculator: { operation: "power", value: 2, exponent: 8 }
// Result: { result: 256, operation: "2^8 = 256" }

// Trigonometric functions
advanced-calculator: { operation: "sin", value: Math.PI / 2 }
// Result: { result: 1, operation: "sin(1.5707963267948966) = 1" }
```

## Error Handling

The calculator tools include comprehensive error handling:

- **Division by zero**: Returns error for divide operation with zero divisor
- **Invalid square root**: Returns error for negative numbers
- **Invalid logarithm**: Returns error for non-positive numbers or invalid bases
- **Missing parameters**: Returns error for operations requiring specific parameters

## Configuration

The server is configured via `dynemcp.config.json`. Key settings:

- **Server name**: calculator-mcp-server
- **Component directories**: All components are in `src/` subdirectories
- **Transport**: stdio (default)
- **Logging**: Enabled with info level
- **Validation**: Enabled for all tools

## Adding New Mathematical Tools

Create a new tool in `src/tools/`:

```typescript
import { DyneMCPTool, z } from '@dynemcp/server-dynemcp';

const MyMathToolSchema = z.object({
  input: z.number().describe('Input number'),
  // Add other parameters as needed
});

export class MyMathTool extends DyneMCPTool<typeof MyMathToolSchema> {
  name = 'my-math-tool';
  description = 'Description of my mathematical tool';
  schema = MyMathToolSchema;

  async execute({ input }: z.infer<typeof MyMathToolSchema>) {
    // Implement your mathematical logic here
    const result = /* your calculation */;
    
    return {
      result,
      operation: `my-operation(${input}) = ${result}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export default new MyMathTool();
```

## Development

The server automatically discovers and loads all mathematical tools from the `src/tools/` directory. No manual registration is required.

## License

MIT 