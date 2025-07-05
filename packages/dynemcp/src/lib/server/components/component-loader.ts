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
} from './core/loaders/validators'
import path from 'path'

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
    if (!(await import('fs').then((fs) => fs.existsSync(directory)))) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn(
          `Directory ${directory} does not exist, skipping component loading`
        )
      }
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
 * loadMiddlewareFromDirectory: Loads the middleware.ts file from the src directory.
 * Uses the same robust loading and validation logic as other components.
 * @param directory - The root directory where src/middleware.ts should be located
 * @returns The path to the middleware file if found and valid, null otherwise
 */
export async function loadMiddlewareFromDirectory(
  directory: string
): Promise<string | null> {
  try {
    // Check if the directory exists
    if (!(await import('fs').then((fs) => fs.existsSync(directory)))) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn(
          `Directory ${directory} does not exist, skipping middleware loading`
        )
      }
      return null
    }

    const middlewarePath = path.join(directory, 'src', 'middleware.ts')

    // Check if the middleware file exists
    if (!(await import('fs').then((fs) => fs.existsSync(middlewarePath)))) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn(`Middleware file not found at ${middlewarePath}`)
      }
      return null
    }

    // Try to load the file to verify it's a valid TypeScript/JavaScript file
    try {
      await import(middlewarePath)
      return middlewarePath
    } catch (error) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn(
          `Failed to load middleware from ${middlewarePath}: ${error}`
        )
      }
      return null
    }
  } catch (error) {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
      console.warn(`Error loading middleware: ${error}`)
    }
    return null
  }
}
