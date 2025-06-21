import { z } from 'zod'

export const name = 'get-agent-status'
export const description = 'Checks the current status of the secure agent.'
export const schema = z.object({})

export async function handler() {
  return {
    status: 'ok',
    message: 'All systems are operational.',
    timestamp: new Date().toISOString(),
  }
}
