// registry.ts
// Main Registry implementation for the DyneMCP Registry module
// -----------------------------------------------------------

import type {
  Registry,
  RegistryItem,
  RegistryLoader,
  RegistryStats,
  LoadAllOptions,
  RegistryItemType,
} from './interfaces'
import { RegistryItemNotFoundError } from './errors'
import { InMemoryRegistryStorage } from './storage'
import { DefaultRegistryLoader } from './loader'
import {
  loadToolsFromDirectory,
  loadResourcesFromDirectory,
  loadPromptsFromDirectory,
  loadRootsFromDirectory,
} from '../../components/component-loader'
import { validateTool } from '../../components/core/loaders/validators'
import path from 'path'
import fs from 'fs'
import { paginateWithCursor } from '../../api/core/utils'
import { getResourceMeta } from '../../api/core/resource'

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
  private authenticationMiddlewarePath: string | null = null

  constructor(
    loader: RegistryLoader = new DefaultRegistryLoader(),
    storage: InMemoryRegistryStorage = new InMemoryRegistryStorage()
  ) {
    this.loader = loader
    this.storage = storage
  }

  /**
   * Load all components from the specified directories (tools, resources, prompts, roots).
   * Uses helpers to load and validate, with logging and error handling.
   * Also loads user roots from src/roots/roots.ts if present.
   */
  async loadAll(
    options: LoadAllOptions & {
      roots?: {
        enabled: boolean
        directory: string
        pattern?: string
      }
    }
  ): Promise<void> {
    if (this.isLoaded) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn('Registry already loaded, skipping...')
      }
      return
    }
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.log('🔄 Loading components...')
    }

    const [toolsResult, resourcesResult, promptsResult, rootsResult] =
      await Promise.all([
        loadToolsFromDirectory(options.tools),
        loadResourcesFromDirectory(options.resources),
        loadPromptsFromDirectory(options.prompts),
        loadRootsFromDirectory(options.roots),
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

    this.storage.addRoots(
      rootsResult.components.map((root) => ({
        id: root.uri,
        type: 'root',
        module: root,
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
        `✅ Loaded ${stats.tools} tools, ${stats.resources} resources, ${stats.prompts} prompts, ${rootsResult.components.length} roots`
      )
    }
    const allErrors = [
      ...toolsResult.errors,
      ...resourcesResult.errors,
      ...promptsResult.errors,
      ...rootsResult.errors,
    ]
    if (allErrors.length > 0 && !process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.warn('⚠️ Loading errors:', allErrors)
    }
    this.isLoaded = true

    // TODO: Resource template logic removed for production release. Re-implement in a future version if needed.

    // Discover src/middleware.ts for authentication
    const projectRoot = process.cwd()

    const candidate = path.join(projectRoot, 'src', 'middleware.ts')
    if (fs.existsSync(candidate)) {
      this.authenticationMiddlewarePath = candidate
    } else {
      this.authenticationMiddlewarePath = null
    }

    /*  // Roots: store loaded roots
    this.roots = rootsResult.components
    this.storage.addRoots(
      rootsResult.components.map((root) => ({
        id: root.uri,
        type: 'root',
        module: root,
      }))
    ) */
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
  getAllResources(): any[] {
    return Array.from(this.storage['items'].values())
      .filter((item) => (item as RegistryItem).type === 'resource')
      .map((item) => getResourceMeta(item.module))
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
   * Get all registered roots.
   */
  getAllRoots(): RegistryItem[] {
    return Array.from(this.storage['items'].values()).filter(
      (item) => (item as RegistryItem).type === 'root'
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
   * Get a specific root by id.
   */
  getRoot(id: string): RegistryItem | undefined {
    return this.storage.getItem('root', id)
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
      roots: all.filter((i) => i.type === 'root').length,
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
  async get(type: RegistryItemType, id: string): Promise<RegistryItem> {
    let item = this.storage.getItem(type, id)
    if (!item) {
      item = await this.loader.loadItem(type, id)
      if (!item) throw new RegistryItemNotFoundError(type, id)
      this.storage.setItem(item)
    }
    return item
  }

  /**
   * Get the resolved path to the authentication middleware, if found.
   */
  getAuthenticationMiddlewarePath(): string | null {
    return this.authenticationMiddlewarePath
  }

  /**
   * Get a component (tool, prompt, resource) by type and id, exposing its completion logic if present.
   */
  getComponentWithCompletion(
    type: RegistryItemType,
    id: string
  ): any | undefined {
    let item: any
    if (type === 'tool') item = this.getTool(id)
    else if (type === 'prompt') item = this.getPrompt(id)
    else if (type === 'resource') item = this.getResource(id)
    if (!item) return undefined
    return item.module
  }

  /**
   * Get paginated tools (MCP-style cursor pagination).
   */
  getPaginatedTools(cursor?: string, pageSize?: number) {
    const all = this.getAllTools().map((item) => item.module)
    return paginateWithCursor(all, cursor, pageSize)
  }

  /**
   * Get paginated prompts (MCP-style cursor pagination).
   */
  getPaginatedPrompts(cursor?: string, pageSize?: number) {
    const all = this.getAllPrompts().map((item) => item.module)
    return paginateWithCursor(all, cursor, pageSize)
  }

  /**
   * Get paginated resources (MCP-style cursor pagination).
   */
  getPaginatedResources(cursor?: string, pageSize?: number) {
    const all = this.getAllResources().map((item) => item.module)
    return paginateWithCursor(all, cursor, pageSize)
  }

  /**
   * Get all registered resource objects (originals, no metadatos)
   */
  getAllResourceObjects(): any[] {
    return Array.from(this.storage['items'].values())
      .filter((item) => (item as any).type === 'resource')
      .map((item) => (item as any).module)
  }
}

/**
 * Singleton instance of the Registry.
 */
export const registry = new DyneMCPRegistry()
