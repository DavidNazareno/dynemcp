// storage.ts
// Storage backend logic for the DyneMCP Registry module
// Provides an in-memory storage implementation for registry items.
// -----------------------------------------------------

import type { RegistryItem, RegistryStorage } from './interfaces'

/**
 * InMemoryRegistryStorage: Stores registry items in memory using a Map.
 * Supports adding, retrieving, and clearing tools, resources, prompts, and samples.
 */
export class InMemoryRegistryStorage implements RegistryStorage {
  private items: Map<string, RegistryItem> = new Map()

  getItem(type: RegistryItem['type'], id: string): RegistryItem | undefined {
    return this.items.get(this.key(type, id))
  }

  setItem(item: RegistryItem): void {
    this.items.set(this.key(item.type, item.id), item)
  }

  clear(): void {
    this.items.clear()
  }

  /**
   * Add multiple tools to the storage.
   */
  addTools(tools: RegistryItem[]): void {
    tools.forEach((tool) => {
      if (tool.type === 'tool') {
        this.setItem(tool)
      }
    })
  }

  /**
   * Add multiple resources to the storage.
   */
  addResources(resources: RegistryItem[]): void {
    resources.forEach((resource) => {
      if (resource.type === 'resource') {
        this.setItem(resource)
      }
    })
  }

  /**
   * Add multiple prompts to the storage.
   */
  addPrompts(prompts: RegistryItem[]): void {
    prompts.forEach((prompt) => {
      if (prompt.type === 'prompt') {
        this.setItem(prompt)
      }
    })
  }

  /**
   * Add multiple samples to the storage.
   */
  addSamples(samples: RegistryItem[]): void {
    samples.forEach((sample) => {
      if (sample.type === 'sample') {
        this.setItem(sample)
      }
    })
  }

  /**
   * Add multiple roots to the storage.
   */
  addRoots(roots: RegistryItem[]): void {
    roots.forEach((root) => {
      if (root.type === 'root') {
        this.setItem(root)
      }
    })
  }

  private key(type: string, id: string): string {
    return `${type}:${id}`
  }
}
