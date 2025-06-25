import { DyneMCPTool, CallToolResult } from '@dynemcp/dynemcp'
import { z } from 'zod'

const MathSchema = z.object({
  operation: z
    .enum(['add', 'multiply', 'power'])
    .describe('The mathematical operation'),
  numbers: z.array(z.number()).describe('Array of numbers to operate on'),
})

export class MathTool extends DyneMCPTool {
  readonly name = 'math'
  readonly description = 'Performs various mathematical operations'
  readonly inputSchema = MathSchema.shape
  override readonly annotations = {
    title: 'Math Tool',
    readOnlyHint: true,
    openWorldHint: false,
  }

  execute(input: z.infer<typeof MathSchema>): CallToolResult {
    const { operation, numbers } = input

    if (!numbers?.length) {
      return {
        content: [{ type: 'text', text: 'At least one number is required' }],
        isError: true,
      }
    }

    let result: number
    switch (operation) {
      case 'add':
        result = numbers.reduce((sum: number, num: number) => sum + num, 0)
        break
      case 'multiply':
        result = numbers.reduce(
          (product: number, num: number) => product * num,
          1
        )
        break
      case 'power':
        if (numbers.length !== 2) {
          return {
            content: [
              {
                type: 'text',
                text: 'Power operation requires exactly 2 numbers',
              },
            ],
            isError: true,
          }
        }
        result = Math.pow(numbers[0], numbers[1])
        break
      default:
        return {
          content: [{ type: 'text', text: 'Invalid operation' }],
          isError: true,
        }
    }

    return {
      content: [
        {
          type: 'text',
          text: `${operation}(${numbers.join(', ')}) = ${result}`,
        },
      ],
    }
  }
}

export default new MathTool()
