// component-loader.ts
// DyneMCP Component Loader: Orchestrates loading of tools, resources, and prompts
// Provides generic and specialized loaders for plug-and-play component discovery.
// -----------------------------------------------------------------------------

import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../api'
import { findFilesRecursively } from './core/loaders/file-discovery'
import { loadComponentFromFile } from './core/loaders/dynamic-loader'
import {
  validateTool,
  validateResource,
  validatePrompt,
  validateMiddleware,
} from './core/loaders/validators'
import fs from 'fs'

export interface MiddlewareDefinition {
  // Puedes ajustar esto según la forma esperada de tu middleware
  [key: string]: any
}

/**
 * Options for loading components from a directory.
 * - enabled: Whether autoload is enabled for this component type.
 * - directory: The root directory to search for components.
 * - pattern: (Optional) Glob or regex pattern for matching files (not yet implemented).
 */
export interface LoadOptions {
  enabled: boolean
  directory: string
  pattern?: string
  transport?: string // Added transport option
}

/**
 * Result of loading components from a directory.
 * - components: Array of successfully loaded and validated components.
 * - errors: Array of error messages for failed loads.
 */
export interface LoadResult<T> {
  components: T[]
  errors: string[]
}

/**
 * Centralized component loading result
 */
export interface LoadAllComponentsResult {
  tools: ToolDefinition[]
  resources: ResourceDefinition[]
  prompts: PromptDefinition[]
  errors: string[]
}

/**
 * loadComponentsFromDirectory: Generic loader for components (tools, resources, prompts) from a directory.
 * Uses a type guard validator to ensure only valid components are loaded.
 *
 * @param options - LoadOptions specifying directory and enablement
 * @param validator - Type guard function for the component type
 * @returns LoadResult<T> with loaded components and any errors
 */
export async function loadComponentsFromDirectory<T>(
  options: LoadOptions,
  validator: (component: unknown) => component is T
): Promise<LoadResult<T>> {
  const { enabled, directory } = options
  if (!enabled || !directory) {
    return { components: [], errors: [] }
  }
  const components: T[] = []
  const errors: string[] = []
  try {
    // Check if the directory exists before searching
    if (!fs.existsSync(directory)) {
      console.warn(
        `Directory ${directory} does not exist, skipping component loading`
      )

      return { components: [], errors: [] }
    }
    // Recursively find all matching component files
    const files = await findFilesRecursively(directory)
    for (const file of files) {
      try {
        // Dynamically import and validate each component
        const component = await loadComponentFromFile(file, validator)
        if (component) {
          components.push(component)
        }
      } catch (error) {
        const errorMsg = `Failed to load component from ${file}: ${error}`
        errors.push(errorMsg)

        console.warn(errorMsg)
      }
    }
  } catch (error) {
    const errorMsg = `Failed to scan directory ${directory}: ${error}`
    errors.push(errorMsg)

    console.warn(errorMsg)
  }
  return { components, errors }
}

/**
 * loadToolsFromDirectory: Loads all tools from a directory using the standard tool validator.
 * @param options - LoadOptions for tools
 * @returns LoadResult<ToolDefinition>
 */
export async function loadToolsFromDirectory(
  options: LoadOptions
): Promise<LoadResult<ToolDefinition>> {
  return loadComponentsFromDirectory(options, validateTool)
}

/**
 * loadResourcesFromDirectory: Loads all resources from a directory using the standard resource validator.
 * @param options - LoadOptions for resources
 * @returns LoadResult<ResourceDefinition>
 */
export async function loadResourcesFromDirectory(
  options: LoadOptions
): Promise<LoadResult<ResourceDefinition>> {
  return loadComponentsFromDirectory(options, validateResource)
}

/**
 * loadPromptsFromDirectory: Loads all prompts from a directory using the standard prompt validator.
 * @param options - LoadOptions for prompts
 * @returns LoadResult<PromptDefinition>
 */
export async function loadPromptsFromDirectory(
  options: LoadOptions
): Promise<LoadResult<PromptDefinition>> {
  return loadComponentsFromDirectory(options, validatePrompt)
}

/**
 * loadMiddlewareFromDirectory: Loads all middleware from a directory using the standard middleware validator.
 * @param options - LoadOptions for middleware
 * @returns LoadResult<MiddlewareDefinition>
 */
export async function loadMiddlewareFromDirectory(
  options: LoadOptions
): Promise<LoadResult<MiddlewareDefinition>> {
  return loadComponentsFromDirectory(options, validateMiddleware)
}

/**
 * Centralized function to load all components (tools, resources, prompts) based on environment.
 *
 * @param options - Configuration for loading components
 * @returns LoadAllComponentsResult with all loaded components and any errors
 */
export async function loadAllComponents(options: {
  tools: LoadOptions
  resources: LoadOptions
  prompts: LoadOptions
}): Promise<LoadAllComponentsResult> {
  // Solo modo desarrollo
  return loadAllComponentsDevelopment(options)
}

/**
 * Load components in development mode (file discovery)
 */
async function loadAllComponentsDevelopment(options: {
  tools: LoadOptions
  resources: LoadOptions
  prompts: LoadOptions
}): Promise<LoadAllComponentsResult> {
  const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
    loadToolsFromDirectory(options.tools),
    loadResourcesFromDirectory(options.resources),
    loadPromptsFromDirectory(options.prompts),
  ])

  const allErrors = [
    ...toolsResult.errors,
    ...resourcesResult.errors,
    ...promptsResult.errors,
  ]

  return {
    tools: toolsResult.components,
    resources: resourcesResult.components,
    prompts: promptsResult.components,
    errors: allErrors,
  }
}

// Legacy functions for backward compatibility (deprecated)
export async function loadAllTools(): Promise<ToolDefinition[]> {
  const result = await loadAllComponents({
    tools: { enabled: true, directory: './src/tools' },
    resources: { enabled: false, directory: '' },
    prompts: { enabled: false, directory: '' },
  })
  return result.tools
}

export async function loadAllResources(): Promise<ResourceDefinition[]> {
  const result = await loadAllComponents({
    tools: { enabled: false, directory: '' },
    resources: { enabled: true, directory: './src/resources' },
    prompts: { enabled: false, directory: '' },
  })
  return result.resources
}

export async function loadAllPrompts(): Promise<PromptDefinition[]> {
  const result = await loadAllComponents({
    tools: { enabled: false, directory: '' },
    resources: { enabled: false, directory: '' },
    prompts: { enabled: true, directory: './src/prompts' },
  })
  return result.prompts
}
