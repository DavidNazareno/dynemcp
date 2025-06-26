# DyneMCP Calculator Template

This template demonstrates a calculator agent with advanced mathematical capabilities using the new file-based architecture.

## 🏗️ Project Structure

```
src/
├── index.ts                    # Server entry point
├── tools/                      # Tools directory
│   ├── basic-calculator/       # Basic calculator folder
│   │   └── tool.ts           # Main calculator tool (loaded automatically)
│   └── advanced-calculator/    # Advanced calculator folder
│       ├── tool.ts           # Main advanced tool (loaded automatically)
│       └── utils.ts          # Mathematical utilities (NOT loaded automatically)
└── prompts/                    # Prompts directory
    ├── calculator-prompt/      # Calculator prompt folder
    │   └── prompt.ts         # Main prompt file (loaded automatically)
    └── math-context/          # Math context prompt folder
        └── prompt.ts         # Main prompt file (loaded automatically)
```

## 🔑 Key Architecture Features

### File-Based Auto-Loading

- **Tools**: Only `tool.ts` files are loaded as tools
- **Prompts**: Only `prompt.ts` files are loaded as prompts
- **Helper Files**: `utils.ts` and other files are available for import but NOT auto-loaded

### Advanced Calculator with Utilities

The advanced calculator demonstrates the power of the new architecture:

```
tools/advanced-calculator/
├── tool.ts        # ✅ Main tool (auto-loaded)
└── utils.ts       # ✅ Safe math evaluator (helper, not auto-loaded)
```

## 🛠️ Available Components

### Tools

- **basic-calculator**: Simple arithmetic operations (add, subtract, multiply, divide)
- **advanced-calculator**: Complex expression evaluation with safety features

### Prompts

- **calculator-prompt**: Basic calculator assistance prompt
- **math-context**: Advanced mathematical context with guidelines

### Mathematical Features

- **Safe Expression Evaluation**: Prevents code injection
- **Multiple Input Formats**: Simple operations and complex expressions
- **Error Handling**: Graceful handling of invalid operations
- **Mathematical Utilities**: Tokenizer, parser, and evaluator functions

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

## 🧮 Usage Examples

### Basic Calculator

```typescript
// Simple arithmetic
{ a: 10, b: 5, operator: "add" }      // Returns: "10 add 5 = 15"
{ a: 20, b: 4, operator: "divide" }   // Returns: "20 divide 4 = 5"
```

### Advanced Calculator

```typescript
// Complex expressions
{
  expression: '2 * (3 + 4) / 2'
} // Returns: "2 * (3 + 4) / 2 = 7"
{
  expression: '10 + 20 * 3'
} // Returns: "10 + 20 * 3 = 70"
```

## 🛡️ Security Features

The advanced calculator includes robust security measures:

- **Input Sanitization**: Only mathematical characters allowed
- **Pattern Validation**: Prevents dangerous code patterns
- **Safe Evaluation**: Custom parser instead of `eval()`
- **Error Containment**: Graceful error handling

## 📝 Adding New Components

### Adding a Scientific Calculator

```bash
mkdir src/tools/scientific-calculator
touch src/tools/scientific-calculator/tool.ts
touch src/tools/scientific-calculator/scientific-utils.ts
```

### Adding Mathematical Constants

```typescript
// src/tools/scientific-calculator/constants.ts (helper file)
export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
}
```

## 🔧 Configuration

Uses `dynemcp.config.json` for framework configuration:

```json
{
  "name": "calculator-template",
  "version": "1.0.0",
  "description": "Calculator template with advanced mathematical capabilities",
  "autoload": {
    "tools": {
      "enabled": true,
      "directory": "src/tools"
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
- [Mathematical Expression Parsing](https://en.wikipedia.org/wiki/Recursive_descent_parser)
- [Safe Code Evaluation](https://owasp.org/www-community/attacks/Code_Injection)

## 🤝 Contributing

1. Follow the file-based architecture patterns
2. Add mathematical utilities as helper files
3. Implement proper input validation
4. Test edge cases thoroughly
5. Document mathematical algorithms
