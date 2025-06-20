import { ComponentStorage, type RegistryStats } from './registry-storage.js'
import { loadAllComponents, type LoadAllOptions } from './registry-loader.js'
import { validateAllTools } from '../validation.js'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../interfaces.js'
import { ConsoleLogger, type Logger } from '../../../cli/index.js'

export class Registry {
  private storage = new ComponentStorage()
  private isLoaded = false

  /**
   * Load all components from the specified directories
   */
  async loadAll(options: LoadAllOptions, logger?: Logger): Promise<void> {
    const log = logger ?? new ConsoleLogger()
    if (this.isLoaded) {
      log.warn('Registry already loaded, skipping...')
      return
    }

    log.info('🔄 Loading components...')

    const result = await loadAllComponents(options, log)

    // Add components to storage
    this.storage.addTools(result.tools)
    this.storage.addResources(result.resources)
    this.storage.addPrompts(result.prompts)

    // Validate tools
    try {
      validateAllTools(result.tools)
    } catch (error) {
      log.warn(
        `⚠️ Tool validation warnings: ${
          error instanceof Error ? error.message : error
        }`
      )
    }

    // Log results
    const stats = this.storage.getStats()
    log.success(
      `✅ Loaded ${stats.tools} tools, ${stats.resources} resources, ${stats.prompts} prompts`
    )

    if (result.errors.length > 0) {
      log.warn(`⚠️ Loading errors: ${result.errors}`)
    }

    this.isLoaded = true
  }

  /**
   * Get all registered tools
   */
  getAllTools(): ToolDefinition[] {
    return this.storage.getAllTools()
  }

  /**
   * Get all registered resources
   */
  getAllResources(): ResourceDefinition[] {
    return this.storage.getAllResources()
  }

  /**
   * Get all registered prompts
   */
  getAllPrompts(): PromptDefinition[] {
    return this.storage.getAllPrompts()
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.storage.getTool(name)
  }

  /**
   * Get a specific resource by URI
   */
  getResource(uri: string): ResourceDefinition | undefined {
    return this.storage.getResource(uri)
  }

  /**
   * Get a specific prompt by ID
   */
  getPrompt(id: string): PromptDefinition | undefined {
    return this.storage.getPrompt(id)
  }

  /**
   * Get registry statistics
   */
  get stats(): RegistryStats {
    return this.storage.getStats()
  }

  /**
   * Clear all components
   */
  clear(): void {
    this.storage.clear()
    this.isLoaded = false
  }

  /**
   * Check if registry is loaded
   */
  get loaded(): boolean {
    return this.isLoaded
  }
}

// Export singleton instance
export const registry = new Registry()
