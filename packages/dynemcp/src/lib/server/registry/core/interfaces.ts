// interfaces.ts
// Public types and interfaces for the DyneMCP Registry module
// ----------------------------------------------------------

/**
 * Represents a generic registry item (Tool, Prompt, Resource, etc).
 */
export interface RegistryItem {
  id: string
  type: 'tool' | 'prompt' | 'resource'
  module: any
}

/**
 * Interface for the Registry Loader.
 */
export interface RegistryLoader {
  loadItem(
    type: 'tool' | 'prompt' | 'resource',
    id: string
  ): Promise<RegistryItem>
}

/**
 * Interface for the Registry Storage backend.
 */
export interface RegistryStorage {
  getItem(
    type: 'tool' | 'prompt' | 'resource',
    id: string
  ): RegistryItem | undefined
  setItem(item: RegistryItem): void
  clear(): void
}

/**
 * Main Registry interface.
 */
export interface Registry {
  get(type: 'tool' | 'prompt' | 'resource', id: string): Promise<RegistryItem>
  preloadAll(): Promise<void>
}

/**
 * Statistics for the registry contents.
 */
export interface RegistryStats {
  tools: number
  resources: number
  prompts: number
  total: number
}

/**
 * Options for batch loading all components into the registry.
 */
export interface LoadAllOptions {
  tools: { enabled: boolean; directory: string }
  resources: { enabled: boolean; directory: string }
  prompts: { enabled: boolean; directory: string }
}
