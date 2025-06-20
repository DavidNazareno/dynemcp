/**
 * Configuration module for DyneMCP
 * Provides utilities to load and validate configuration from various sources
 */

import { loadConfigFromFile, loadConfigFromEnv, createDefaultConfig, mergeConfigs } from '../helpers/config-loader.js';
import type { DyneMCPConfig } from './interfaces.js';

export type { DyneMCPConfig } from './interfaces.js';

export function loadConfig(configPath?: string): DyneMCPConfig {
  const defaultConfig = createDefaultConfig();
  
  // Load from config file if provided
  const fileConfig = configPath ? loadConfigFromFile(configPath) : {};
  
  // Load from environment variables if enabled
  const envConfig = defaultConfig.config?.env ? loadConfigFromEnv() : {};
  
  // Merge all configurations
  return mergeConfigs(defaultConfig, fileConfig, envConfig);
}
