// Loader and parser for DyneMCP server configuration files
// Supports loading, merging, and validating config from JSON or TypeScript files.

import { promises as fsPromises } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { ConfigSchema, BaseConfigSchema, type BaseConfig } from './schemas'
import type { DyneMCPConfig } from './interfaces'
import { ConfigError } from './errors'
import { createDefaultConfig, DEFAULT_CONFIG } from './defaults'

/**
 * executeTypeScriptFile: Executes a TypeScript config file using tsx and returns the result.
 */
async function executeTypeScriptFile(tsPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Create a wrapper script that imports and exports the config
    const wrapperScript = `
      import config from '${tsPath.replace(/\\/g, '\\\\')}';
      console.log(JSON.stringify(config));
    `

    const tsxProcess = spawn('npx', ['tsx', '-e', wrapperScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
    })

    let stdout = ''
    let stderr = ''

    tsxProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    tsxProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    tsxProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const config = JSON.parse(stdout.trim())
          resolve(config)
        } catch (error) {
          reject(
            new Error(`Failed to parse TypeScript config output: ${error}`)
          )
        }
      } else {
        reject(new Error(`TypeScript config execution failed: ${stderr}`))
      }
    })

    tsxProcess.on('error', (error) => {
      reject(new Error(`Failed to execute TypeScript config: ${error.message}`))
    })
  })
}

/**
 * resolveConfigPath: Resolves the absolute path to the configuration file.
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
 * readConfigFile: Reads and parses the configuration file (JSON or TypeScript).
 * Throws ConfigError if the file is not found or invalid.
 * @param configPath Path to the config file.
 * @returns Parsed configuration object.
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
      // Execute TypeScript file using tsx
      const result = await executeTypeScriptFile(absolutePath)
      return result
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
 * loadBaseConfig: Loads the base configuration (minimal fields only).
 * @param configPath Optional path to the config file.
 * @returns Parsed and validated base configuration.
 */
export async function loadBaseConfig(configPath?: string): Promise<BaseConfig> {
  const config = await readConfigFile(configPath || DEFAULT_CONFIG)
  return BaseConfigSchema.parse(config)
}

/**
 * loadConfig: Loads the full configuration, merging with defaults and validating.
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
