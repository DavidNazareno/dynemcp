/**
 * Configuration module for DyneMCP
 * Provides utilities to load and validate configuration from various sources
 */

import {
  loadConfigFromFile,
  createDefaultConfig,
  mergeConfigs,
} from '../helpers/config-loader.js'
import type { DyneMCPConfig } from './interfaces.js'
import path from 'path'
import fs from 'fs'

export type { DyneMCPConfig } from './interfaces.js'

export function loadConfig(configPath?: string): DyneMCPConfig {
  const defaultConfig = createDefaultConfig()

  // Si no se pasa configPath, buscar dynemcp.config.json en el cwd
  let resolvedConfigPath = configPath
  if (!resolvedConfigPath) {
    const candidate = path.resolve(process.cwd(), 'dynemcp.config.json')
    if (fs.existsSync(candidate)) {
      resolvedConfigPath = candidate
    } else {
      throw new Error(
        'No se encontró el archivo de configuración dynemcp.config.json en el directorio actual. ' +
          'Por favor, asegúrate de que el archivo existe o pasa la ruta explícitamente a createMCPServer.'
      )
    }
  }

  // Load from config file if provided
  const fileConfig = resolvedConfigPath
    ? loadConfigFromFile(resolvedConfigPath)
    : {}

  // NO cargar variables de entorno
  // const envConfig = defaultConfig.config?.env ? loadConfigFromEnv() : {}

  // Merge only defaults and file config
  return mergeConfigs(defaultConfig, fileConfig, {})
}
