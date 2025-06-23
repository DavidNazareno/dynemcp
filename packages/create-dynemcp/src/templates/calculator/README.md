# Calculator DyneMCP Template

A mathematical MCP (Model Context Protocol) server template with comprehensive calculation tools, mathematical resources, and specialized prompts for mathematical problem solving.

## 🚀 What's Included

This template provides a complete mathematical agent foundation with:

- **Basic Calculator**: Four basic arithmetic operations with error handling
- **Advanced Calculator**: Scientific functions (trigonometry, logarithms, powers)
- **Mathematical Resources**: Constants, formulas, and reference materials
- **Specialized Prompts**: Mathematical problem-solving assistance
- **Error Handling**: Comprehensive validation and edge case management
- **TypeScript Support**: Full type safety for mathematical operations

## 📁 Project Structure

```
calculator-project/
├── src/
│   ├── index.ts                  # Main server entry point
│   ├── tools/                    # Mathematical tools
│   │   ├── basic-calculator.ts   # Basic arithmetic operations
│   │   └── advanced-calculator.ts # Scientific functions
│   ├── resources/                # Mathematical resources
│   │   └── math-reference.ts     # Constants and formulas
│   └── prompts/                  # Mathematical prompts
│       └── calculator-prompt.ts  # Problem-solving assistance
├── dynemcp.config.json           # DyneMCP configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## 🧮 Mathematical Tools

### Basic Calculator (`src/tools/basic-calculator.ts`)

Provides fundamental arithmetic operations:

```typescript
import { DyneMCPTool } from '@dynemcp/dynemcp'
import { z } from 'zod'

const BasicCalculatorSchema = z.object({
  a: z.number().describe('The first number'),
  b: z.number().describe('The second number'),
  operator: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('The operation to perform'),
})

export class BasicCalculatorTool extends DyneMCPTool {
  get name() {
    return 'basic_calculator'
  }
  readonly description = 'A simple calculator that can perform basic arithmetic'
  readonly schema = BasicCalculatorSchema

  async execute(input: z.infer<typeof BasicCalculatorSchema>) {
    const { a, b, operator } = input
    switch (operator) {
      case 'add': return { result: a + b }
      case 'subtract': return { result: a - b }
      case 'multiply': return { result: a * b }
      case 'divide':
        if (b === 0) throw new Error('Cannot divide by zero')
        return { result: a / b }
    }
  }
}
```

**Supported Operations**:
- ➕ **Addition**: Sum two numbers
- ➖ **Subtraction**: Subtract second from first number
- ✖️ **Multiplication**: Multiply two numbers  
- ➗ **Division**: Divide first by second number (with zero-division protection)

### Advanced Calculator (`src/tools/advanced-calculator.ts`)

Provides scientific and advanced mathematical functions:

```typescript
const AdvancedCalculatorSchema = z.object({
  operation: z.enum([
    'power', 'sqrt', 'abs', 'sin', 'cos', 'tan', 
    'log', 'ln', 'ceil', 'floor', 'round'
  ]),
  value: z.number().describe('The input value'),
  exponent: z.number().optional().describe('Exponent for power operation')
})

export class AdvancedCalculatorTool extends DyneMCPTool {
  // Implementation with comprehensive mathematical functions
}
```

**Available Functions**:
- 🔢 **Power**: Raise number to a power (`value^exponent`)
- √ **Square Root**: Calculate square root
- 📐 **Trigonometry**: sin, cos, tan functions
- 📊 **Logarithms**: Natural log (ln) and base-10 log
- 🔄 **Rounding**: ceil, floor, round operations
- ➕ **Absolute Value**: Get absolute value

## 📚 Mathematical Resources

### Math Reference (`src/resources/math-reference.ts`)

Comprehensive mathematical reference materials:

```typescript
const mathReference: ResourceDefinition = {
  uri: 'math://reference',
  name: 'Mathematical Reference',
  description: 'Comprehensive mathematical constants and formulas',
  content: `
# Mathematical Reference

## Constants
- π (Pi): 3.14159265359...
- e (Euler's number): 2.71828182846...
- φ (Golden ratio): 1.61803398875...

## Basic Formulas
- Area of circle: A = πr²
- Pythagorean theorem: a² + b² = c²
- Quadratic formula: x = (-b ± √(b²-4ac)) / 2a

## Trigonometric Identities
- sin²(x) + cos²(x) = 1
- tan(x) = sin(x) / cos(x)
- sin(2x) = 2sin(x)cos(x)
  `,
  contentType: 'text/markdown'
}
```

**Includes**:
- 🔢 **Mathematical Constants**: π, e, φ, and more
- 📐 **Geometric Formulas**: Area, volume, perimeter calculations
- 🧮 **Algebraic Identities**: Common algebraic relationships
- 📈 **Trigonometric Identities**: Essential trigonometric relationships
- 📊 **Statistical Formulas**: Mean, variance, standard deviation

## 💬 Mathematical Prompts

### Calculator Prompt (`src/prompts/calculator-prompt.ts`)

Specialized prompt for mathematical problem solving:

```typescript
const calculatorPrompt: PromptDefinition = {
  id: 'math-assistant',
  name: 'Mathematical Problem Solver',
  description: 'Helps solve mathematical problems step by step',
  content: `You are an expert mathematical assistant. When helping with math problems:

1. **Break down complex problems** into smaller, manageable steps
2. **Show your work** clearly with each calculation step
3. **Use available tools** for precise calculations
4. **Explain concepts** when helpful for understanding
5. **Verify results** by working backwards when possible
6. **Provide alternative methods** when applicable

For calculations, use the available calculator tools:
- basic_calculator: For arithmetic operations (+, -, ×, ÷)
- advanced_calculator: For scientific functions (sin, cos, log, etc.)

Always prioritize accuracy and clear explanations.`
}
```

**Capabilities**:
- 📝 **Step-by-step Solutions**: Break down complex problems
- 🔍 **Verification**: Double-check calculations
- 📖 **Explanations**: Educational approach to problem solving
- 🛠️ **Tool Integration**: Seamless use of calculator tools
- 🎯 **Multiple Methods**: Show alternative solution approaches

## 🚀 Quick Start

1. **Navigate to your project**:
   ```bash
   cd calculator-project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Test calculations**:
   ```bash
   # The server is ready to handle mathematical queries
   # Connect with your MCP client and try:
   # - "Calculate 15 + 27"
   # - "What's the sine of 45 degrees?"
   # - "Find the square root of 144"
   ```

## 🧪 Example Usage

### Basic Arithmetic

```json
{
  "tool": "basic_calculator",
  "arguments": {
    "a": 25,
    "b": 17,
    "operator": "add"
  }
}
// Returns: { "result": 42 }
```

### Scientific Functions

```json
{
  "tool": "advanced_calculator", 
  "arguments": {
    "operation": "sin",
    "value": 1.5708
  }
}
// Returns: { "result": 1.0 } (sin(π/2))
```

### Mathematical Reference

```json
{
  "resource": "math://reference"
}
// Returns the complete mathematical reference document
```

## 🔧 Customization

### Adding New Mathematical Functions

Create additional tools for specialized mathematics:

```typescript
// src/tools/statistics-calculator.ts
import { DyneMCPTool } from '@dynemcp/dynemcp'
import { z } from 'zod'

const StatisticsSchema = z.object({
  operation: z.enum(['mean', 'median', 'mode', 'variance']),
  values: z.array(z.number()).describe('Array of numbers')
})

export class StatisticsCalculatorTool extends DyneMCPTool {
  get name() { return 'statistics_calculator' }
  readonly description = 'Statistical calculations on arrays of numbers'
  readonly schema = StatisticsSchema

  async execute(input: z.infer<typeof StatisticsSchema>) {
    const { operation, values } = input
    
    switch (operation) {
      case 'mean':
        return { result: values.reduce((a, b) => a + b) / values.length }
      case 'median':
        const sorted = values.sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        return { 
          result: sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid] 
        }
      // Add more statistical functions...
    }
  }
}

export default new StatisticsCalculatorTool()
```

### Adding Mathematical Constants

Extend the math reference with additional constants:

```typescript
// src/resources/physics-constants.ts
const physicsConstants: ResourceDefinition = {
  uri: 'physics://constants',
  name: 'Physics Constants',
  description: 'Important physical constants and formulas',
  content: `
# Physics Constants

## Universal Constants
- Speed of light (c): 299,792,458 m/s
- Planck constant (h): 6.62607015 × 10⁻³⁴ J⋅s
- Gravitational constant (G): 6.67430 × 10⁻¹¹ m³⋅kg⁻¹⋅s⁻²

## Formulas
- E = mc² (Mass-energy equivalence)
- F = ma (Newton's second law)
- v = λf (Wave equation)
  `,
  contentType: 'text/markdown'
}

export default physicsConstants
```

### Creating Specialized Prompts

Add domain-specific mathematical assistants:

```typescript
// src/prompts/geometry-assistant.ts
const geometryPrompt: PromptDefinition = {
  id: 'geometry-assistant',
  name: 'Geometry Problem Solver',
  description: 'Specialized assistant for geometric problems',
  content: `You are a geometry expert. When solving geometric problems:

1. **Visualize the problem** - describe the geometric setup
2. **Identify known and unknown** elements
3. **Choose appropriate formulas** from the math reference
4. **Calculate step by step** using available tools
5. **Verify using geometric properties** (angles sum to 180°, etc.)

Focus on 2D and 3D geometry, trigonometry, and coordinate geometry.`
}

export default geometryPrompt
```

## 📊 Advanced Features

### Error Handling

The template includes comprehensive error handling:

```typescript
// Division by zero protection
if (b === 0) {
  throw new Error('Cannot divide by zero')
}

// Domain validation for functions
if (operation === 'sqrt' && value < 0) {
  throw new Error('Cannot take square root of negative number')
}

// Input validation
if (!Number.isFinite(value)) {
  throw new Error('Input must be a finite number')
}
```

### Precision Management

Handle floating-point precision issues:

```typescript
// Round to avoid floating-point errors
const result = Math.round((a + b) * 1e10) / 1e10
```

### Unit Conversion Support

Extend with unit conversion capabilities:

```typescript
const unitConverter: ToolDefinition = {
  name: 'unit_converter',
  description: 'Convert between different units',
  schema: z.object({
    value: z.number(),
    fromUnit: z.string(),
    toUnit: z.string(),
    category: z.enum(['length', 'weight', 'temperature'])
  }),
  handler: async ({ value, fromUnit, toUnit, category }) => {
    // Implement unit conversion logic
  }
}
```

## 🎯 Use Cases

### Educational Applications
- **Math Tutoring**: Step-by-step problem solving
- **Homework Help**: Guided mathematical assistance
- **Concept Explanation**: Understanding mathematical principles

### Professional Applications  
- **Engineering Calculations**: Technical mathematical computations
- **Scientific Research**: Statistical and mathematical analysis
- **Financial Modeling**: Mathematical modeling and calculations

### Development Applications
- **Algorithm Development**: Mathematical function testing
- **Data Analysis**: Statistical computations
- **Simulation**: Mathematical modeling support

## 🧪 Testing

### Manual Testing

```bash
# Test basic operations
npm run dev

# In your MCP client, try:
# - Basic: "Calculate 123 + 456"
# - Advanced: "What's the cosine of π?"
# - Complex: "Solve x² - 5x + 6 = 0"
```

### Unit Testing

```typescript
// Test mathematical accuracy
describe('BasicCalculator', () => {
  it('should add correctly', async () => {
    const result = await basicCalculator.execute({
      a: 10, b: 20, operator: 'add'
    })
    expect(result.result).toBe(30)
  })

  it('should handle division by zero', async () => {
    await expect(basicCalculator.execute({
      a: 10, b: 0, operator: 'divide'
    })).rejects.toThrow('Cannot divide by zero')
  })
})
```

## 🔗 Related Templates

- **Default**: For basic MCP learning and simple tools
- **HTTP Server**: For web-based mathematical services
- **Secure Agent**: For enterprise mathematical applications
- **Dynamic Agent**: For adaptive mathematical reasoning

## 🤝 Contributing

Improvements for mathematical functionality are welcome!

1. Fork the repository
2. Add new mathematical tools or improve existing ones
3. Include comprehensive tests
4. Update documentation
5. Submit a pull request

## 📄 License

This template is part of the DyneMCP project and is licensed under the MIT License.

## 🔗 Links

- [DyneMCP Framework](https://github.com/dynemcp/dynemcp)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Mathematical Reference](https://en.wikipedia.org/wiki/List_of_mathematical_constants)
- [Create DyneMCP CLI](https://www.npmjs.com/package/@dynemcp/create-dynemcp) 