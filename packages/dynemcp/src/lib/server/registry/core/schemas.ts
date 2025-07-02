// schemas.ts
// Zod schemas and validation logic for the DyneMCP Registry module
// Provides schemas for validating registry item configuration and lists.
// ---------------------------------------------------------------

import { z } from 'zod'

/**
 * RegistryItemSchema: Zod schema for a single registry item.
 */
export const RegistryItemSchema = z.object({
  id: z.string(),
  type: z.enum(['tool', 'prompt', 'resource', 'resourceTemplate']),
  module: z.any(),
})

/**
 * RegistryItemsSchema: Zod schema for a list of registry items.
 */
export const RegistryItemsSchema = z.array(RegistryItemSchema)
