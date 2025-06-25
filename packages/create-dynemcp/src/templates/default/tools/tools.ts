import { DyneMCPTool, CallToolResult } from '@dynemcp/dynemcp'
import { z } from 'zod'

// Greeter Tool using class pattern
const GreeterSchema = z.object({
  name: z.string().describe('The name to greet'),
})

export class GreeterTool extends DyneMCPTool {
  readonly name = 'greeter'
  readonly description = 'A simple tool that greets the user'
  readonly inputSchema = GreeterSchema.shape
  readonly annotations = {
    title: 'Greeter Tool',
    readOnlyHint: true,
    openWorldHint: false,
  }

  execute(input: z.infer<typeof GreeterSchema>): CallToolResult {
    const { name } = input

    if (!name?.trim()) {
      return {
        content: [{ type: 'text', text: 'Name cannot be empty' }],
        isError: true,
      }
    }

    return {
      content: [{ type: 'text', text: `Hello, ${name}!` }],
    }
  }
}

// Math Tool using class pattern
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
  readonly annotations = {
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

// Export instances of the tools
export default [new GreeterTool(), new MathTool()]
