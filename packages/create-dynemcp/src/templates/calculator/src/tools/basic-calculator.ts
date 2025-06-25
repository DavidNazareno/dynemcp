import { DyneMCPTool, CallToolResult } from '@dynemcp/dynemcp'
import { z } from 'zod'

const BasicCalculatorSchema = z.object({
  a: z.number().describe('The first number'),
  b: z.number().describe('The second number'),
  operator: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('The operation to perform'),
})

export class BasicCalculatorTool extends DyneMCPTool {
  readonly name = 'basic_calculator'
  readonly description = 'A simple calculator that can perform basic arithmetic'
  readonly inputSchema = BasicCalculatorSchema.shape
  readonly annotations = {
    title: 'Basic Calculator',
    readOnlyHint: true,
    openWorldHint: false,
  }

  execute(input: z.infer<typeof BasicCalculatorSchema>): CallToolResult {
    const { a, b, operator } = input

    if (operator === 'divide' && b === 0) {
      return {
        content: [{ type: 'text', text: 'Cannot divide by zero' }],
        isError: true,
      }
    }

    let result: number
    switch (operator) {
      case 'add':
        result = a + b
        break
      case 'subtract':
        result = a - b
        break
      case 'multiply':
        result = a * b
        break
      case 'divide':
        result = a / b
        break
    }

    return {
      content: [{ type: 'text', text: `${a} ${operator} ${b} = ${result}` }],
    }
  }
}

export default new BasicCalculatorTool()
