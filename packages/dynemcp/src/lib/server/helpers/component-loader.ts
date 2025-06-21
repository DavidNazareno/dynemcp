import * as fs from 'fs'
import * as path from 'path'
import {
  DyneMCPTool,
  DyneMCPResource,
  DyneMCPPrompt,
} from '../core/base.js'
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../core/interfaces.js'

export interface LoadOptions {
  enabled: boolean
  directory: string
  pattern?: string
}

export interface LoadResult<T> {
  components: T[]
  errors: string[]
}

export async function loadComponentsFromDirectory<T>(
  options: LoadOptions,
  validator: (component: any) => component is T
): Promise<LoadResult<T>> {
  const { enabled, directory } = options

  if (!enabled || !directory) {
    return { components: [], errors: [] }
  }

  const components: T[] = []
  const errors: string[] = []

  try {
    // Check if directory exists
    if (!fs.existsSync(directory)) {
      console.warn(
        `Directory ${directory} does not exist, skipping component loading`
      )
      return { components: [], errors: [] }
    }

    // Find all matching files using fs.readdir recursively
    const files = await findFilesRecursively(directory)

    // Load each file
    for (const file of files) {
      try {
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

async function findFilesRecursively(dir: string): Promise<string[]> {
  const files: string[] = []

  async function scanDirectory(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, {
      withFileTypes: true,
    })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        await scanDirectory(fullPath)
      } else if (entry.isFile()) {
        // Simple pattern matching for .ts and .js files
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
          files.push(fullPath)
        }
      }
    }
  }

  await scanDirectory(dir)
  return files
}

async function loadComponentFromFile<T>(
  filePath: string,
  validator: (component: any) => component is T
): Promise<T | null> {
  try {
    // Dynamic import works with relative paths for tsx
    const relativePath = path.relative(process.cwd(), filePath)
    const module = await import(path.toNamespacedPath(relativePath))
    const exported = module.default

    if (!exported) {
      return null
    }

    // Handle class-based components
    if (typeof exported === 'function') {
      // Check if it's one of our base classes
      if (
        exported.prototype instanceof DyneMCPTool ||
        exported.prototype instanceof DyneMCPResource ||
        exported.prototype instanceof DyneMCPPrompt
      ) {
        const instance = new exported()
        const definition = instance.toDefinition()
        if (validator(definition)) {
          return definition as T
        }
      }
    }

    // Handle object-based components
    if (typeof exported === 'object' && validator(exported)) {
      return exported
    }

    return null
  } catch (error) {
    throw new Error(`Import failed: ${error}`)
  }
}

export function validateTool(component: any): component is ToolDefinition {
  return (
    component &&
    typeof component === 'object' &&
    typeof component.name === 'string' &&
    typeof component.description === 'string' &&
    typeof component.schema === 'object' &&
    typeof component.handler === 'function'
  )
}

export function validateResource(
  component: any
): component is ResourceDefinition {
  return (
    component &&
    typeof component === 'object' &&
    typeof component.uri === 'string' &&
    typeof component.name === 'string' &&
    (typeof component.content === 'string' ||
      typeof component.content === 'function')
  )
}

export function validatePrompt(component: any): component is PromptDefinition {
  return (
    component &&
    typeof component === 'object' &&
    typeof component.id === 'string' &&
    typeof component.name === 'string' &&
    typeof component.content === 'string'
  )
}
