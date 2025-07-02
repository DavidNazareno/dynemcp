// Dynamic loading logic for the DyneMCP Registry module
// Provides the default RegistryLoader for dynamic module imports.

import type { RegistryItem, RegistryLoader } from './interfaces'
import { RegistryItemLoadError } from './errors'

/**
 * DefaultRegistryLoader: Loads registry items dynamically by type and id.
 * Can be extended or replaced for custom loading strategies.
 */
export class DefaultRegistryLoader implements RegistryLoader {
  async loadItem(
    type: 'tool' | 'prompt' | 'resource' | 'sample',
    id: string
  ): Promise<RegistryItem> {
    try {
      // Example dynamic import path logic (customize as needed)
      const modulePath = `../${type}s/${id}`

      const module = await import(modulePath)
      return { id, type, module }
    } catch (err: any) {
      throw new RegistryItemLoadError(type, id, err?.message)
    }
  }
}

// TODO: Resource template loader logic removed for production release. Re-implement in a future version if needed.
