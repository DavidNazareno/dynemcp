/**
 * DyneMCP Build Configuration Module
 * Zero-config, production-ready. All logic lives in core/.
 * This file only exports the public API for config loading and build config.
 *
 * - Loads and validates DyneMCP build configuration (async).
 * - Exposes the default build config (users cannot override).
 */

import { promises as fs } from 'fs'
import path from 'path'
import { DyneMCPConfigSchema } from './schema'
import { DEFAULT_BUILD_CONFIG } from './default'

export type DyneMCPConfig = typeof DyneMCPConfigSchema._type

/**
 * Load the DyneMCP configuration file (async, for general config only).
 *
 * @param configPath Path to config file (default: dynemcp.config.ts)
 * @returns DyneMCPConfig object
 */
export async function loadConfig(
  configPath = 'dynemcp.config.ts'
): Promise<DyneMCPConfig> {
  const absolutePath = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath)

  try {
    try {
      await fs.access(absolutePath)
    } catch {
      throw new Error(`Configuration file not found: ${absolutePath}`)
    }

    if (absolutePath.endsWith('.ts')) {
      const imported = await import(absolutePath)
      if (typeof imported.default !== 'function') {
        throw new Error('Missing default export (defineConfig) in TS config')
      }
      return imported.default()
    } else {
      const configContent = await fs.readFile(absolutePath, 'utf-8')
      const config: unknown = JSON.parse(configContent)
      return DyneMCPConfigSchema.parse(config)
    }
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      throw new Error(
        `Invalid configuration: ${JSON.stringify((error as any).errors)}`
      )
    } else {
      throw new Error(`Failed to load configuration: ${error}`)
    }
  }
}

/**
 * Get the default build configuration (users cannot override this).
 *
 * @returns Default build config object
 */
export function getBuildConfig() {
  return DEFAULT_BUILD_CONFIG
}
