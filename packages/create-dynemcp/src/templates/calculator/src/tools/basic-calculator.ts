import { DyneMCPTool, z } from '@dynemcp/server-dynemcp'

const BasicCalculatorSchema = z.object({
  operation: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('The mathematical operation to perform'),
  a: z.number().describe('First number'),
  b: z.number().describe('Second number'),
})

export class BasicCalculatorTool extends DyneMCPTool<
  typeof BasicCalculatorSchema
> {
  name = 'basic-calculator'
  description =
    'Perform basic mathematical operations (add, subtract, multiply, divide)'
  schema = BasicCalculatorSchema

  async execute({ operation, a, b }: z.infer<typeof BasicCalculatorSchema>) {
    let result: number

    switch (operation) {
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
        if (b === 0) {
          throw new Error('Division by zero is not allowed')
        }
        result = a / b
        break
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    return {
      result,
      operation: `${a} ${this.getOperationSymbol(operation)} ${b} = ${result}`,
      timestamp: new Date().toISOString(),
    }
  }

  private getOperationSymbol(operation: string): string {
    switch (operation) {
      case 'add':
        return '+'
      case 'subtract':
        return '-'
      case 'multiply':
        return '×'
      case 'divide':
        return '÷'
      default:
        return operation
    }
  }
}

export default new BasicCalculatorTool()
