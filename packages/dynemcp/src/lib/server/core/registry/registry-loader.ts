import {
  loadToolsFromDirectory,
  loadResourcesFromDirectory,
  loadPromptsFromDirectory,
} from '../../helpers/component-loader.js'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  AutoloadConfig,
} from '../interfaces.js'

export interface LoadAllOptions {
  tools: AutoloadConfig
  resources: AutoloadConfig
  prompts: AutoloadConfig
}

export interface LoadAllResult {
  tools: ToolDefinition[]
  resources: ResourceDefinition[]
  prompts: PromptDefinition[]
  errors: string[]
}

export async function loadAllComponents(
  options: LoadAllOptions
): Promise<LoadAllResult> {
  const errors: string[] = []

  // Load tools using specialized loader
  const toolsResult = await loadToolsFromDirectory(options.tools)
  errors.push(...toolsResult.errors)

  // Load resources using specialized loader
  const resourcesResult = await loadResourcesFromDirectory(options.resources)
  errors.push(...resourcesResult.errors)

  // Load prompts using specialized loader
  const promptsResult = await loadPromptsFromDirectory(options.prompts)
  errors.push(...promptsResult.errors)

  return {
    tools: toolsResult.components,
    resources: resourcesResult.components,
    prompts: promptsResult.components,
    errors,
  }
}
