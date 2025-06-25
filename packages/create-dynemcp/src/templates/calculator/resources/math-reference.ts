import { DyneMCPResource } from '@dynemcp/dynemcp'

export class MathReferenceResource extends DyneMCPResource {
  readonly uri = 'resource://calculator/math-reference'
  readonly name = 'math-reference'
  readonly description = 'Mathematical operations reference and examples'
  readonly mimeType = 'text/markdown'

  getContent(): string {
    return `# Mathematical Calculator Reference

## Basic Operations

### Arithmetic Operations
- **Addition (+)**: Combines two or more numbers
- **Subtraction (-)**: Finds the difference between numbers
- **Multiplication (*)**: Repeated addition of a number
- **Division (/)**: Splits a number into equal parts

### Supported Operators
\`\`\`
+  Addition       Example: 5 + 3 = 8
-  Subtraction    Example: 10 - 4 = 6
*  Multiplication Example: 6 * 7 = 42
/  Division       Example: 20 / 4 = 5
\`\`\`

## Tool Usage

### Basic Calculator
Use for simple two-number operations:
\`\`\`json
{
  "a": 15,
  "b": 7,
  "operator": "add"
}
\`\`\`

### Advanced Calculator
Use for complex expressions:
\`\`\`json
{
  "expression": "2 * (3 + 4) / 2"
}
\`\`\`

## Expression Examples

### Valid Expressions
- \`2 + 3 * 4\` → 14 (follows order of operations)
- \`(5 + 3) * 2\` → 16 (parentheses first)
- \`Math.sqrt(16)\` → 4 (square root)
- \`Math.pow(2, 3)\` → 8 (power function)
- \`Math.PI * 2\` → 6.283... (using constants)

### Mathematical Functions
- \`Math.sqrt(x)\` - Square root
- \`Math.pow(x, y)\` - Power (x^y)
- \`Math.abs(x)\` - Absolute value
- \`Math.round(x)\` - Round to nearest integer
- \`Math.floor(x)\` - Round down
- \`Math.ceil(x)\` - Round up

### Constants
- \`Math.PI\` - Pi (3.14159...)
- \`Math.E\` - Euler's number (2.71828...)

## Error Handling

### Common Errors
- **Division by Zero**: Cannot divide any number by zero
- **Invalid Syntax**: Malformed mathematical expressions
- **Overflow**: Results too large to represent
- **Type Error**: Non-numeric inputs where numbers expected

### Safety Notes
- All expressions are evaluated in a secure context
- Only mathematical operations are allowed
- No arbitrary code execution possible
- Input validation prevents injection attacks

## Usage Tips
1. Use parentheses to clarify operation order
2. Check for division by zero before calculations
3. Consider precision limits for very large numbers
4. Test complex expressions with simpler parts first

Last updated: ${new Date().toISOString()}`
  }
}

export default new MathReferenceResource() 