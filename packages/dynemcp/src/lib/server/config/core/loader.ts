import { promises as fsPromises } from 'fs'
import path from 'path'
import { ConfigSchema, BaseConfigSchema, type BaseConfig } from './schemas'
import type { DyneMCPConfig } from './interfaces'
import { ConfigError } from './errors'
import { createDefaultConfig, DEFAULT_CONFIG } from './defaults'

/**
 * Resolves the absolute path to the configuration file.
 * @param configPath Optional path to the config file.
 * @returns Absolute path to the config file.
 */
function resolveConfigPath(configPath?: string): string {
  const candidate = configPath || DEFAULT_CONFIG
  return path.isAbsolute(candidate)
    ? candidate
    : path.resolve(process.cwd(), candidate)
}

/**
 * Reads and parses the configuration file, supporting both JSON and TypeScript (with defineConfig).
 * @param configPath Path to the config file.
 * @returns Parsed configuration object.
 * @throws ConfigError if the file is not found or invalid.
 */
async function readConfigFile(configPath: string): Promise<any> {
  const absolutePath = resolveConfigPath(configPath)
  try {
    await fsPromises.access(absolutePath)
  } catch {
    throw ConfigError.fileNotFound(absolutePath)
  }
  try {
    if (absolutePath.endsWith('.ts')) {
      // Dynamic import for TypeScript config
      const imported = await import(absolutePath)
      if (typeof imported.defineConfig !== 'function') {
        throw ConfigError.invalidConfig(
          'Missing defineConfig export in TS config'
        )
      }
      return imported.defineConfig()
    } else {
      const content = await fsPromises.readFile(absolutePath, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw ConfigError.parseError(error.message)
    }
    throw ConfigError.invalidConfig(String(error))
  }
}

/**
 * Loads the base configuration (minimal fields only).
 * @param configPath Optional path to the config file.
 * @returns Parsed and validated base configuration.
 */
export async function loadBaseConfig(configPath?: string): Promise<BaseConfig> {
  const config = await readConfigFile(configPath || DEFAULT_CONFIG)
  return BaseConfigSchema.parse(config)
}

/**
 * Loads the full configuration, merging with defaults and validating.
 * @param configPath Optional path to the config file.
 * @returns Parsed and validated full configuration.
 */
export async function loadConfig(configPath?: string): Promise<DyneMCPConfig> {
  const defaults = createDefaultConfig()
  let fileConfig = {}
  try {
    fileConfig = await readConfigFile(configPath || DEFAULT_CONFIG)
  } catch (error) {
    // If the file does not exist, use only defaults
    if (error instanceof ConfigError && error.message.includes('not found')) {
      fileConfig = {}
    } else {
      throw error
    }
  }
  // Merge and validate
  const merged = { ...defaults, ...fileConfig }
  return ConfigSchema.parse(merged)
}
