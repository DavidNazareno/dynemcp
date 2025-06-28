// component-loader.ts
// DyneMCP Component Loader: Orquestador de carga de tools, resources y prompts
// ---------------------------------------------------------------------------

import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../core/interfaces.js'
import { findFilesRecursively } from './core/loaders/file-discovery.js'
import { loadComponentFromFile } from './core/loaders/dynamic-loader.js'
import {
  validateTool,
  validateResource,
  validatePrompt,
} from './core/loaders/validators.js'

export interface LoadOptions {
  enabled: boolean
  directory: string
  pattern?: string
}

export interface LoadResult<T> {
  components: T[]
  errors: string[]
}

/**
 * Carga componentes genéricos desde un directorio usando un validador.
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
    if (!(await import('fs').then((fs) => fs.existsSync(directory)))) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn(
          `Directory ${directory} does not exist, skipping component loading`
        )
      }
      return { components: [], errors: [] }
    }
    const files = await findFilesRecursively(directory)
    for (const file of files) {
      try {
        const component = await loadComponentFromFile(file, validator)
        if (component) {
          components.push(component)
        }
      } catch (error) {
        const errorMsg = `Failed to load component from ${file}: ${error}`
        errors.push(errorMsg)
        if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
          console.warn(errorMsg)
        }
      }
    }
  } catch (error) {
    const errorMsg = `Failed to scan directory ${directory}: ${error}`
    errors.push(errorMsg)
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.warn(errorMsg)
    }
  }
  return { components, errors }
}

/**
 * Carga todos los tools desde un directorio.
 */
export async function loadToolsFromDirectory(
  options: LoadOptions
): Promise<LoadResult<ToolDefinition>> {
  return loadComponentsFromDirectory(options, validateTool)
}

/**
 * Carga todos los resources desde un directorio.
 */
export async function loadResourcesFromDirectory(
  options: LoadOptions
): Promise<LoadResult<ResourceDefinition>> {
  return loadComponentsFromDirectory(options, validateResource)
}

/**
 * Carga todos los prompts desde un directorio.
 */
export async function loadPromptsFromDirectory(
  options: LoadOptions
): Promise<LoadResult<PromptDefinition>> {
  return loadComponentsFromDirectory(options, validatePrompt)
}
