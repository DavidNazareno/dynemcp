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
  readonly name = 'basic_calculator'
  readonly description = 'A simple calculator that can perform basic arithmetic'
  readonly inputSchema = {
    a: z.number().describe('The first number'),
    b: z.number().describe('The second number'),
    operator: z
      .enum(['add', 'subtract', 'multiply', 'divide'])
      .describe('The operation to perform'),
  }
  readonly annotations = {
    title: 'Basic Calculator',
    readOnlyHint: true,
    openWorldHint: false,
  }

  async execute(
    input: z.infer<typeof BasicCalculatorSchema>
  ): Promise<{ result: number }> {
    const { a, b, operator } = input
    switch (operator) {
      case 'add':
        return { result: a + b }
      case 'subtract':
        return { result: a - b }
      case 'multiply':
        return { result: a * b }
      case 'divide':
        if (b === 0) {
          throw new Error('Cannot divide by zero')
        }
        return { result: a / b }
    }
  }
}

export default new BasicCalculatorTool()
