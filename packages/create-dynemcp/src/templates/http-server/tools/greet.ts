import { z } from 'zod'
import { ToolDefinition } from '@dynemcp/dynemcp'

const GreetSchema = z.object({
  name: z.string().describe('The name of the person to greet.'),
})

const greetTool: ToolDefinition = {
  name: 'greet',
  description: 'Greets a person by name.',
  schema: GreetSchema,
  handler: async ({ name }: z.infer<typeof GreetSchema>) => {
    return `Hello, ${name}!`
  },
}

export default greetTool
