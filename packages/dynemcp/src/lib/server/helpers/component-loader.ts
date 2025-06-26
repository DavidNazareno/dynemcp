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
  validator: (component: unknown) => component is T
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
        // Only load specific component files: tool.ts, resource.ts, prompt.ts
        // This allows for helper files and utilities in the same directory
        if (
          entry.name === 'tool.ts' ||
          entry.name === 'tool.js' ||
          entry.name === 'resource.ts' ||
          entry.name === 'resource.js' ||
          entry.name === 'prompt.ts' ||
          entry.name === 'prompt.js'
        ) {
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

// Helper function to resolve and compile relative imports
async function resolveAndCompileRelativeImports(
  tsCode: string,
  sourceDir: string,
  tempDir: string
): Promise<void> {
  // Find relative imports in the TypeScript code
  const importRegex = /import\s+.*?\s+from\s+['"](\.[^'"]+)['"]/g
  const matches = Array.from(tsCode.matchAll(importRegex))

  for (const match of matches) {
    const relativeImport = match[1]

    // Try different extensions
    const extensions = ['.ts', '.js']
    let sourceFile: string | null = null

    for (const ext of extensions) {
      const fullPath = path.resolve(sourceDir, relativeImport + ext)
      if (fs.existsSync(fullPath)) {
        sourceFile = fullPath
        break
      }
    }

    if (sourceFile) {
      try {
        // Create the target path in temp directory
        const relativePath = path.relative(sourceDir, sourceFile)
        const targetPath = path.join(
          tempDir,
          relativePath.replace(/\.ts$/, '.js')
        )

        // Ensure target directory exists
        await fs.promises.mkdir(path.dirname(targetPath), { recursive: true })

        // Read and compile the dependency
        const depCode = await fs.promises.readFile(sourceFile, 'utf-8')
        const depResult = await transform(depCode, {
          loader: 'ts',
          format: 'cjs',
          target: 'node16',
          platform: 'node',
        })

        // Write compiled dependency to temp directory
        await fs.promises.writeFile(targetPath, depResult.code)

        // Recursively process imports in the dependency
        await resolveAndCompileRelativeImports(
          depCode,
          path.dirname(sourceFile),
          tempDir
        )
      } catch (error) {
        console.warn(`Failed to compile dependency ${sourceFile}: ${error}`)
      }
    }
  }
}

async function loadComponentFromFile<T>(
  filePath: string,
  validator: (component: unknown) => component is T
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

        // Process imports in the TypeScript code to resolve relative imports
        const sourceDir = path.dirname(absolutePath)
        const processedCode = result.code

        // Handle relative imports by pre-compiling dependent files
        await resolveAndCompileRelativeImports(tsCode, sourceDir, tempDir)

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
    // For relative paths that start with '.', resolve from temp directory
    if (id.startsWith('.')) {
      const relativePath = path.resolve('${tempDir}', id);
      return originalRequire(relativePath);
    }
    // Try project directory first for external modules
    if (!path.isAbsolute(id)) {
      return projectRequire(id);
    }
    // Use original require for absolute paths
    return originalRequire(id);
  } catch (error) {
    // Fallback to original require
    return originalRequire(id);
  }
};

${processedCode}
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
        const definition = (instance as any).toDefinition()
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
      const definition = (exported as any).toDefinition()
      if (validator(definition)) {
        return definition as T
      }
    }

    // Handle object-based components
    if (typeof exported === 'object') {
      // Normalize parameters to inputSchema for tools before validation
      if ('parameters' in exported && !('inputSchema' in exported)) {
        const normalized = { ...exported } as any
        normalized.inputSchema = (exported as any).parameters
        delete normalized.parameters
        exported = normalized
      }

      if (validator(exported)) {
        return exported
      }
    }

    return null
  } catch (error) {
    throw new Error(`Import failed: ${error}`)
  }
}

export function validateTool(component: unknown): component is ToolDefinition {
  return (
    component !== null &&
    typeof component === 'object' &&
    'name' in component &&
    typeof (component as any).name === 'string' &&
    ('description' in component === false ||
      typeof (component as any).description === 'string') &&
    ('inputSchema' in component || 'parameters' in component) &&
    (typeof (component as any).inputSchema === 'object' ||
      typeof (component as any).parameters === 'object') &&
    'execute' in component &&
    typeof (component as any).execute === 'function'
  )
}

export function validateResource(
  component: unknown
): component is ResourceDefinition {
  return (
    component !== null &&
    typeof component === 'object' &&
    'uri' in component &&
    typeof (component as any).uri === 'string' &&
    'name' in component &&
    typeof (component as any).name === 'string' &&
    'content' in component &&
    (typeof (component as any).content === 'string' ||
      typeof (component as any).content === 'function')
  )
}

export function validatePrompt(
  component: unknown
): component is PromptDefinition {
  return (
    component !== null &&
    typeof component === 'object' &&
    'name' in component &&
    typeof (component as any).name === 'string' &&
    'getMessages' in component &&
    typeof (component as any).getMessages === 'function'
  )
}

export async function loadToolsFromDirectory(
  options: LoadOptions
): Promise<LoadResult<ToolDefinition>> {
  return loadComponentsFromDirectory(options, validateTool)
}

export async function loadResourcesFromDirectory(
  options: LoadOptions
): Promise<LoadResult<ResourceDefinition>> {
  return loadComponentsFromDirectory(options, validateResource)
}

export async function loadPromptsFromDirectory(
  options: LoadOptions
): Promise<LoadResult<PromptDefinition>> {
  return loadComponentsFromDirectory(options, validatePrompt)
}
