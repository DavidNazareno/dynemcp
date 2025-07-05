// interfaces.ts
// Public types and interfaces for the DyneMCP Registry module
// Defines core types for registry items, loader, storage, and batch loading options.
// ----------------------------------------------------------

/**
 * RegistryItemType: Supported component types in the registry.
 */
export type RegistryItemType =
  | 'tool'
  | 'prompt'
  | 'resource'
  | 'sample'
  | 'root'

export interface RegistryItem {
  id: string
  type: RegistryItemType
  module: any
}

/**
 * RegistryItem: Represents a single item (tool, prompt, resource, sample) in the registry.
 */

/**
 * RegistryLoader: Interface for loading items into the registry.
 */
export interface RegistryLoader {
  loadItem(type: RegistryItemType, id: string): Promise<RegistryItem>
}

/**
 * RegistryStorage: Interface for registry storage backends.
 */
export interface RegistryStorage {
  getItem(type: RegistryItemType, id: string): RegistryItem | undefined
  setItem(item: RegistryItem): void
  clear(): void
}

/**
 * Registry: Main registry interface for loading and preloading items.
 */
export interface Registry {
  get(type: RegistryItemType, id: string): Promise<RegistryItem>
}

/**
 * RegistryStats: Statistics about the registry contents.
 */
export interface RegistryStats {
  tools: number
  resources: number
  prompts: number
  total: number
}

/**
 * LoadAllOptions: Options for batch loading all components into the registry.
 */
export interface LoadAllOptions {
  tools: { enabled: boolean; directory: string }
  resources: { enabled: boolean; directory: string }
  prompts: { enabled: boolean; directory: string }
  samples?: { enabled: boolean; directory: string }
}
