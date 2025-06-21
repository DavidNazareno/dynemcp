import { z } from 'zod'

export const name = 'get-initial-memory-usage'
export const description =
  'Gets the memory usage of the agent process at startup.'
export const schema = z.object({})

// Get memory usage once at startup and reuse it
const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024

export async function handler() {
  return `Initial memory usage was: ${initialMemoryUsage.toFixed(2)} MB`
}
