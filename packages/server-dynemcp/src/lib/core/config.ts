/**
 * Configuration module for DyneMCP
 * Provides utilities to load and validate configuration from various sources
 */

import { z } from 'zod';
import { SERVER_VERSION } from './constants.js';

// Define the schema for configuration validation
const ConfigSchema = z
  .object({
    server: z
      .object({
        name: z.string().default('dynemcp-server'),
        version: z.string().default(SERVER_VERSION),
      })
      .default({}),
    tools: z
      .object({
        directory: z.string().optional(),
        autoRegister: z.boolean().default(true),
      })
      .default({}),
    resources: z
      .object({
        directory: z.string().optional(),
        autoRegister: z.boolean().default(true),
      })
      .default({}),
    prompts: z
      .object({
        directory: z.string().optional(),
        autoRegister: z.boolean().default(true),
      })
      .default({}),
  })
  .default({});

// Define the type for the configuration
export type DyneMCPConfig = z.infer<typeof ConfigSchema>;

/**
 * Load configuration from various sources
 * @param _configPath Path to configuration file (optional)
 * @returns Validated configuration object
 */
export function loadConfig(_configPath?: string): DyneMCPConfig {
  // Default configuration
  const defaultConfig: DyneMCPConfig = {
    server: {
      name: 'dynemcp-server',
      version: SERVER_VERSION,
    },
    tools: {
      autoRegister: true,
    },
    resources: {
      autoRegister: true,
    },
    prompts: {
      autoRegister: true,
    },
  };

  // TODO: Load configuration from file if provided
  // TODO: Merge with environment variables

  // Validate and return the configuration
  return ConfigSchema.parse(defaultConfig);
}
