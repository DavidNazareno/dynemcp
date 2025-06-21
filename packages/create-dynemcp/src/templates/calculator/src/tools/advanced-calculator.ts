import { DyneMCPTool } from '@dynemcp/dynemcp'
import { z } from 'zod'

const AdvancedCalculatorSchema = z.object({
  expression: z
    .string()
    .describe(
      'The mathematical expression to evaluate, e.g., "2 * (3 + 4) / 2"'
    ),
})

export class AdvancedCalculatorTool extends DyneMCPTool {
  get name() {
    return 'advanced_calculator'
  }
  readonly description =
    'A more advanced calculator that can handle complex expressions'
  readonly schema = AdvancedCalculatorSchema

  async execute(
    input: z.infer<typeof AdvancedCalculatorSchema>
  ): Promise<{ result: number }> {
    try {
      const result = new Function(`return ${input.expression}`)()
      return { result }
    } catch (error) {
      throw new Error(`Invalid expression: ${error}`)
    }
  }
}

export default new AdvancedCalculatorTool()
