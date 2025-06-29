// registry.ts
// Main Registry implementation for the DyneMCP Registry module
// -----------------------------------------------------------

import {
  Registry,
  RegistryItem,
  RegistryLoader,
  RegistryStats,
  LoadAllOptions,
} from './interfaces.js'
import { RegistryItemNotFoundError } from './errors.js'
import { InMemoryRegistryStorage } from './storage.js'
import { DefaultRegistryLoader } from './loader.js'
import {
  loadToolsFromDirectory,
  loadResourcesFromDirectory,
  loadPromptsFromDirectory,
} from '../../components/component-loader.js'
import { validateTool } from '../../components/core/loaders/validators.js'

/**
 * DyneMCP Registry - Main Registry Class
 *
 * Provides loading, caching, and querying of tools, prompts, and resources.
 * Maintains all previous API and helpers, using modular storage and loader.
 * Includes validation, logging, and singleton export.
 */

export class DyneMCPRegistry implements Registry {
  private storage: InMemoryRegistryStorage
  private loader: RegistryLoader
  private isLoaded = false

  constructor(
    loader: RegistryLoader = new DefaultRegistryLoader(),
    storage: InMemoryRegistryStorage = new InMemoryRegistryStorage()
  ) {
    this.loader = loader
    this.storage = storage
  }

  /**
   * Load all components from the specified directories (tools, resources, prompts).
   * Uses helpers to load and validate, with logging and error handling.
   */
  async loadAll(options: LoadAllOptions): Promise<void> {
    if (this.isLoaded) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn('Registry already loaded, skipping...')
      }
      return
    }
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.log('🔄 Loading components...')
    }
    const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
      loadToolsFromDirectory(options.tools),
      loadResourcesFromDirectory(options.resources),
      loadPromptsFromDirectory(options.prompts),
    ])
    this.storage.clear()
    this.storage.addTools(
      toolsResult.components.map((tool) => ({
        id: tool.name,
        type: 'tool',
        module: tool,
      }))
    )
    this.storage.addResources(
      resourcesResult.components.map((resource) => ({
        id: resource.uri,
        type: 'resource',
        module: resource,
      }))
    )
    this.storage.addPrompts(
      promptsResult.components.map((prompt) => ({
        id: prompt.name,
        type: 'prompt',
        module: prompt,
      }))
    )
    // Validate tools
    try {
      validateTool(toolsResult.components)
    } catch (error) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn(
          '⚠️ Tool validation warnings:',
          error instanceof Error ? error.message : error
        )
      }
    }
    // Log results
    const stats = this.stats
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.log(
        `✅ Loaded ${stats.tools} tools, ${stats.resources} resources, ${stats.prompts} prompts`
      )
    }
    const allErrors = [
      ...toolsResult.errors,
      ...resourcesResult.errors,
      ...promptsResult.errors,
    ]
    if (allErrors.length > 0 && !process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.warn('⚠️ Loading errors:', allErrors)
    }
    this.isLoaded = true
  }

  /**
   * Get all registered tools.
   */
  getAllTools(): RegistryItem[] {
    // Filter by type 'tool'
    return Array.from(this.storage['items'].values()).filter(
      (item) => (item as RegistryItem).type === 'tool'
    ) as RegistryItem[]
  }

  /**
   * Get all registered resources.
   */
  getAllResources(): RegistryItem[] {
    return Array.from(this.storage['items'].values()).filter(
      (item) => (item as RegistryItem).type === 'resource'
    ) as RegistryItem[]
  }

  /**
   * Get all registered prompts.
   */
  getAllPrompts(): RegistryItem[] {
    return Array.from(this.storage['items'].values()).filter(
      (item) => (item as RegistryItem).type === 'prompt'
    ) as RegistryItem[]
  }

  /**
   * Get a specific tool by id.
   */
  getTool(id: string): RegistryItem | undefined {
    return this.storage.getItem('tool', id)
  }

  /**
   * Get a specific resource by id.
   */
  getResource(id: string): RegistryItem | undefined {
    return this.storage.getItem('resource', id)
  }

  /**
   * Get a specific prompt by id.
   */
  getPrompt(id: string): RegistryItem | undefined {
    return this.storage.getItem('prompt', id)
  }

  /**
   * Get registry statistics.
   */
  get stats(): RegistryStats {
    const all = Array.from(this.storage['items'].values()) as RegistryItem[]
    return {
      tools: all.filter((i) => i.type === 'tool').length,
      resources: all.filter((i) => i.type === 'resource').length,
      prompts: all.filter((i) => i.type === 'prompt').length,
      total: all.length,
    }
  }

  /**
   * Clear all components.
   */
  clear(): void {
    this.storage.clear()
    this.isLoaded = false
  }

  /**
   * Check if registry is loaded.
   */
  get loaded(): boolean {
    return this.isLoaded
  }

  /**
   * Get or load a registry item by type and id.
   */
  async get(
    type: 'tool' | 'prompt' | 'resource',
    id: string
  ): Promise<RegistryItem> {
    let item = this.storage.getItem(type, id)
    if (!item) {
      item = await this.loader.loadItem(type, id)
      if (!item) throw new RegistryItemNotFoundError(type, id)
      this.storage.setItem(item)
    }
    return item
  }

  /**
   * Preloads all registry items (optional, implementation can be extended).
   */
  async preloadAll(): Promise<void> {
    // Optionally implement preloading logic here
  }
}

/**
 * Singleton instance of the Registry.
 */
export const registry = new DyneMCPRegistry()
