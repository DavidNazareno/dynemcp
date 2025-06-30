import { tool } from '@dynemcp/dynemcp'
import { z } from 'zod'
import { factorial, isPrime, gcd, MATH_CONSTANTS } from './utils'

const MathSchema = z.object({
  operation: z
    .enum(['add', 'multiply', 'power', 'factorial', 'isPrime', 'gcd'])
    .describe('The mathematical operation'),
  numbers: z.array(z.number()).describe('Array of numbers to operate on'),
})

export default tool(
  MathSchema,
  async ({ operation, numbers }) => {
    if (!numbers?.length) {
      return {
        content: [{ type: 'text', text: 'At least one number is required' }],
        isError: true,
      }
    }
    let result: number | boolean
    try {
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
        case 'factorial':
          if (numbers.length !== 1) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Factorial operation requires exactly 1 number',
                },
              ],
              isError: true,
            }
          }
          result = factorial(numbers[0])
          break
        case 'isPrime':
          if (numbers.length !== 1) {
            return {
              content: [
                { type: 'text', text: 'Prime check requires exactly 1 number' },
              ],
              isError: true,
            }
          }
          result = isPrime(numbers[0])
          break
        case 'gcd':
          if (numbers.length !== 2) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'GCD operation requires exactly 2 numbers',
                },
              ],
              isError: true,
            }
          }
          result = gcd(numbers[0], numbers[1])
          break
        default:
          return {
            content: [{ type: 'text', text: 'Invalid operation' }],
            isError: true,
          }
      }
      const constants = Object.entries(MATH_CONSTANTS)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      return {
        content: [
          {
            type: 'text',
            text: `${operation}(${numbers.join(', ')}) = ${result}\n\nAvailable constants: ${constants}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      }
    }
  },
  {
    name: 'math',
    description:
      'Performs various mathematical operations including advanced functions',
    meta: {
      title: 'Advanced Math Tool',
      readOnlyHint: true,
      openWorldHint: false,
    },
  }
)
