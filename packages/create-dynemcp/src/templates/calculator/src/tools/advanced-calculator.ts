import { DyneMCPTool, CallToolResult } from '@dynemcp/dynemcp'
import { z } from 'zod'

const AdvancedCalculatorSchema = z.object({
  expression: z
    .string()
    .describe(
      'The mathematical expression to evaluate, e.g., "2 * (3 + 4) / 2"'
    ),
})

export class AdvancedCalculatorTool extends DyneMCPTool {
  readonly name = 'advanced_calculator'
  readonly description =
    'A more advanced calculator that can handle complex expressions'
  readonly inputSchema = AdvancedCalculatorSchema.shape
  readonly annotations = {
    title: 'Advanced Calculator',
    readOnlyHint: true,
    openWorldHint: false,
  }

  execute(input: z.infer<typeof AdvancedCalculatorSchema>): CallToolResult {
    const { expression } = input

    try {
      const result = new Function(`return ${expression}`)()

      return {
        content: [{ type: 'text', text: `${expression} = ${result}` }],
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: `Error evaluating expression "${expression}": ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  }
}

export default new AdvancedCalculatorTool()
