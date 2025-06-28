// loader.ts
// Dynamic loading logic for the DyneMCP Registry module
// ----------------------------------------------------

import { RegistryItem, RegistryLoader } from './interfaces'
import { RegistryItemLoadError } from './errors'

/**
 * Default implementation of the RegistryLoader interface.
 * Dynamically imports a module based on type and id.
 */
export class DefaultRegistryLoader implements RegistryLoader {
  async loadItem(
    type: 'tool' | 'prompt' | 'resource',
    id: string
  ): Promise<RegistryItem> {
    try {
      // Example dynamic import path logic (customize as needed)
      const modulePath = `../${type}s/${id}`
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = await import(modulePath)
      return { id, type, module }
    } catch (err: any) {
      throw new RegistryItemLoadError(type, id, err?.message)
    }
  }
}
