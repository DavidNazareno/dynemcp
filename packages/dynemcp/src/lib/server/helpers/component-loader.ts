import fs from 'fs'
import path from 'path'
import os from 'os'
import { pathToFileURL } from 'url'
import { transform } from 'esbuild'

import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../core/interfaces.js'
import { DyneMCPTool, DyneMCPResource, DyneMCPPrompt } from '../core/base.js'

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
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
        console.warn(
          `Directory ${directory} does not exist, skipping component loading`
        )
      }
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
        // Pattern matching for .ts and .js files (but not .temp.js since they're not in source)
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
          files.push(fullPath)
        }
      }
    }
  }

  await scanDirectory(dir)
  return files
}

// Cache for transformed files
const transformCache = new Map<string, string>()

async function loadComponentFromFile<T>(
  filePath: string,
  validator: (component: any) => component is T
): Promise<T | null> {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath)

    let moduleUrl: string

    // Handle TypeScript files by transforming them with esbuild
    if (absolutePath.endsWith('.ts')) {
      // Create a temporary .js file in the OS temp directory to avoid contaminating source
      const tempDir = path.join(os.tmpdir(), 'dynemcp-components')
      await fs.promises.mkdir(tempDir, { recursive: true })

      // Create a unique filename based on the source file path
      const relativePath = path.relative(process.cwd(), absolutePath)
      const tempFileName = relativePath
        .replace(/[/\\]/g, '_')
        .replace('.ts', '.js')
      const jsPath = path.join(tempDir, tempFileName)

      const cacheKey = absolutePath

      // Check if we need to recompile (based on file modification time)
      let needsCompile = !transformCache.has(cacheKey)
      if (!needsCompile) {
        try {
          const tsStats = await fs.promises.stat(absolutePath)
          const jsStats = await fs.promises.stat(jsPath)
          needsCompile = tsStats.mtime > jsStats.mtime
        } catch {
          needsCompile = true
        }
      }

      if (needsCompile) {
        const tsCode = await fs.promises.readFile(absolutePath, 'utf-8')

        // Transform TypeScript to JavaScript using esbuild
        const result = await transform(tsCode, {
          loader: 'ts',
          format: 'cjs', // Use CommonJS to match our build format
          target: 'node16',
          platform: 'node',
        })

        // Modify the compiled code to use proper module resolution from project directory
        const projectDir = process.cwd()
        const modifiedCode = `
// Set up module resolution from project directory
const originalRequire = require;
const Module = require('module');
const path = require('path');

// Create a custom require function that resolves from project directory
const projectRequire = Module.createRequire(path.join('${projectDir}', 'package.json'));

// Override require to use project directory resolution for external modules
require = function(id) {
  try {
    // Try project directory first for external modules
    if (!id.startsWith('.') && !path.isAbsolute(id)) {
      return projectRequire(id);
    }
    // Use original require for relative paths
    return originalRequire(id);
  } catch (error) {
    // Fallback to original require
    return originalRequire(id);
  }
};

${result.code}
`

        // Write the compiled JavaScript to temp directory
        await fs.promises.writeFile(jsPath, modifiedCode)
        transformCache.set(cacheKey, jsPath)
      }

      moduleUrl = pathToFileURL(jsPath).href
    } else {
      // For .js files, use the file URL directly
      moduleUrl = pathToFileURL(absolutePath).href
    }

    // Use dynamic import to load the module
    const module = await import(moduleUrl)
    let exported = module.default

    // Handle getter case where default export is wrapped
    if (exported && typeof exported === 'object' && 'default' in exported) {
      exported = exported.default
    }

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

    // Handle instance-based components (already instantiated)
    if (
      exported instanceof DyneMCPTool ||
      exported instanceof DyneMCPResource ||
      exported instanceof DyneMCPPrompt
    ) {
      const definition = exported.toDefinition()
      if (validator(definition)) {
        return definition as T
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
    (component.description === undefined ||
      typeof component.description === 'string') &&
    typeof component.inputSchema === 'object' &&
    typeof component.execute === 'function'
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
    typeof component.name === 'string' &&
    typeof component.getMessages === 'function'
  )
}
