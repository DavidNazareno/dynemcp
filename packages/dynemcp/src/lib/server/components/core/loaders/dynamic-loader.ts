// dynamic-loader.ts
// Dynamic import and normalization utilities for DyneMCP framework components

import fs from 'fs'
import path from 'path'
import os from 'os'
import { pathToFileURL } from 'url'
import {
  transformTsFile,
  resolveAndCompileRelativeImports,
} from './ts-compiler.js'

/**
 * Dynamically imports a component file (TypeScript or JavaScript), normalizes its export,
 * and validates it using the provided type guard. This enables plug-and-play loading of
 * tools, resources, and prompts in the DyneMCP framework.
 *
 * @param filePath - Absolute path to the component file
 * @param validator - Type guard function to validate the loaded export
 * @returns The validated and normalized component, or null if invalid
 */
export async function loadComponentFromFile<T>(
  filePath: string,
  validator: (component: unknown) => component is T
): Promise<T | null> {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath)
    let moduleUrl: string
    if (absolutePath.endsWith('.ts')) {
      const tempDir = path.join(os.tmpdir(), 'dynemcp-components')
      await fs.promises.mkdir(tempDir, { recursive: true })
      const relativePath = path.relative(process.cwd(), absolutePath)
      const tempFileName = relativePath
        .replace(/[/\\]/g, '_')
        .replace('.ts', '.js')
      const jsPath = path.join(tempDir, tempFileName)
      const tsCode = await fs.promises.readFile(absolutePath, 'utf-8')
      await transformTsFile(absolutePath, jsPath)
      await resolveAndCompileRelativeImports(
        tsCode,
        path.dirname(absolutePath),
        tempDir
      )
      moduleUrl = pathToFileURL(jsPath).href
    } else {
      moduleUrl = pathToFileURL(absolutePath).href
    }
    const module = await import(moduleUrl)
    let exported = module.default
    if (exported && typeof exported === 'object' && 'default' in exported) {
      exported = exported.default
    }
    if (!exported) return null
    // If the export has a toDefinition method, use it to get the normalized definition
    if (typeof exported.toDefinition === 'function') {
      exported = exported.toDefinition()
    }
    // Normalize legacy "parameters" to "inputSchema" for tools
    if (
      typeof exported === 'object' &&
      'parameters' in exported &&
      !('inputSchema' in exported)
    ) {
      const normalized = { ...exported }
      normalized.inputSchema = (exported as any).parameters
      delete normalized.parameters
      exported = normalized
    }
    if (validator(exported)) {
      return exported
    }
    return null
  } catch (error) {
    throw new Error(`Import failed: ${error}`)
  }
}
