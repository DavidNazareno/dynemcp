// schemas.ts
// Zod schemas and validation logic for the DyneMCP Registry module
// ---------------------------------------------------------------

import { z } from 'zod'

/**
 * Schema for validating registry item configuration.
 */
export const RegistryItemSchema = z.object({
  id: z.string(),
  type: z.enum(['tool', 'prompt', 'resource']),
  module: z.any(),
})

/**
 * Schema for validating a list of registry items.
 */
export const RegistryItemsSchema = z.array(RegistryItemSchema)
