import { z } from 'zod'

export const name = 'greet'
export const description = 'Greets a person by name.'
export const schema = z.object({
  name: z.string().describe('The name of the person to greet.'),
})

export async function handler({ name }: z.infer<typeof schema>) {
  return `Hello, ${name}!`
}
