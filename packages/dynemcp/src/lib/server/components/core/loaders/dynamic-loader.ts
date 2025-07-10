// dynamic-loader.ts
// Dynamic import and normalization utilities for DyneMCP framework components
// Provides dynamic loading and validation for tools, resources, and prompts.

import path from 'path'
import { pathToFileURL } from 'url'

/**
 * loadComponentFromFile: Dynamically imports and validates a component file (TS/JS).
 * Normalizes exports and supports legacy/modern formats for plug-and-play loading.
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
    const moduleUrl = pathToFileURL(absolutePath).href
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
