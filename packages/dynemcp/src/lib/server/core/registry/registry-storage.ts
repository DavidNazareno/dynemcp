import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../interfaces.js'

export interface RegistryStats {
  tools: number
  resources: number
  prompts: number
  total: number
}

export class ComponentStorage {
  private tools: Map<string, ToolDefinition> = new Map()
  private resources: Map<string, ResourceDefinition> = new Map()
  private prompts: Map<string, PromptDefinition> = new Map()

  // Tool management
  addTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool)
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name)
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  removeTool(name: string): boolean {
    return this.tools.delete(name)
  }

  // Resource management
  addResource(resource: ResourceDefinition): void {
    this.resources.set(resource.uri, resource)
  }

  getResource(uri: string): ResourceDefinition | undefined {
    return this.resources.get(uri)
  }

  getAllResources(): ResourceDefinition[] {
    return Array.from(this.resources.values())
  }

  removeResource(uri: string): boolean {
    return this.resources.delete(uri)
  }

  // Prompt management
  addPrompt(prompt: PromptDefinition): void {
    this.prompts.set(prompt.name, prompt)
  }

  getPrompt(name: string): PromptDefinition | undefined {
    return this.prompts.get(name)
  }

  getAllPrompts(): PromptDefinition[] {
    return Array.from(this.prompts.values())
  }

  removePrompt(name: string): boolean {
    return this.prompts.delete(name)
  }

  // Bulk operations
  addTools(tools: ToolDefinition[]): void {
    tools.forEach((tool) => this.addTool(tool))
  }

  addResources(resources: ResourceDefinition[]): void {
    resources.forEach((resource) => this.addResource(resource))
  }

  addPrompts(prompts: PromptDefinition[]): void {
    prompts.forEach((prompt) => this.addPrompt(prompt))
  }

  // Statistics
  getStats(): RegistryStats {
    return {
      tools: this.tools.size,
      resources: this.resources.size,
      prompts: this.prompts.size,
      total: this.tools.size + this.resources.size + this.prompts.size,
    }
  }

  // Clear all components
  clear(): void {
    this.tools.clear()
    this.resources.clear()
    this.prompts.clear()
  }
}
