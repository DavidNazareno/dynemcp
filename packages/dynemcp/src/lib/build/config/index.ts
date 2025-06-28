/**
 * Configuration utilities for DyneMCP projects
 */

import { promises as fs } from 'fs'
import path from 'path'
import { z } from 'zod'
import { PATHS, CLI } from '../../../global/config-all-contants.js'

// Define the schema for dynemcp.config.json
const DyneMCPConfigSchema = z.object({
  server: z.object({
    name: z.string(),
    version: z.string(),
  }),
  description: z.string().optional(),
  tools: z.object({
    enabled: z.boolean().default(true),
    directory: z.string().default('./src/tools'),
    pattern: z.string().default('**/*.{ts,js}'),
  }),
  resources: z.object({
    enabled: z.boolean().default(true),
    directory: z.string().default('./src/resources'),
    pattern: z.string().default('**/*.{ts,js}'),
  }),
  prompts: z.object({
    enabled: z.boolean().default(true),
    directory: z.string().default('./src/prompts'),
    pattern: z.string().default('**/*.{ts,js}'),
  }),
  transport: z
    .object({
      type: z
        .enum(CLI.TRANSPORT_TYPES.slice(0, 2) as ['stdio', 'streamable-http'])
        .default(CLI.TRANSPORT_TYPES[0] as 'stdio'),
      options: z.record(z.any()).optional(),
    })
    .optional(),
  logging: z
    .object({
      enabled: z.boolean().default(true),
      level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
      format: z.enum(['text', 'json']).default('text'),
      timestamp: z.boolean().default(true),
      colors: z.boolean().default(true),
    })
    .optional(),
  debug: z
    .object({
      enabled: z.boolean().default(false),
      verbose: z.boolean().default(false),
      showComponentDetails: z.boolean().default(false),
      showTransportDetails: z.boolean().default(false),
    })
    .optional(),
  performance: z
    .object({
      maxConcurrentRequests: z.number().default(100),
      requestTimeout: z.number().default(30000),
      memoryLimit: z.string().default('512mb'),
      enableMetrics: z.boolean().default(false),
    })
    .optional(),
  security: z
    .object({
      enableValidation: z.boolean().default(true),
      strictMode: z.boolean().default(false),
      allowedOrigins: z.array(z.string()).default(['*']),
      rateLimit: z
        .object({
          enabled: z.boolean().default(false),
          maxRequests: z.number().default(100),
          windowMs: z.number().default(900000),
        })
        .optional(),
    })
    .optional(),
  config: z
    .object({
      env: z.boolean().default(true),
    })
    .optional(),
  build: z
    .object({
      entryPoint: z.string().default('./src/index.ts'),
      outDir: z.string().default('./dist'),
      outFile: z.string().default('server.js'),
      format: z.enum(['esm', 'cjs']).default('cjs'),
      minify: z.boolean().default(false),
      sourcemap: z.boolean().default(true),
      bundle: z.boolean().default(false),
      external: z.array(z.string()).default([]),
      define: z.record(z.string()).default({}),
      platform: z.enum(['node', 'browser']).default('node'),
      target: z.string().default('node16'),
      treeShaking: z.boolean().default(false),
      splitting: z.boolean().default(false),
      metafile: z.boolean().default(false),
      watch: z.boolean().default(false),
    })
    .optional(),
})

export type DyneMCPConfig = z.infer<typeof DyneMCPConfigSchema>

/**
 * Build configuration schema
 */
const BuildConfigSchema = z.object({
  entryPoint: z.string(),
  outDir: z.string(),
  outFile: z.string(),
  format: z.enum(['esm', 'cjs', 'iife']),
  minify: z.boolean(),
  sourcemap: z.boolean(),
  bundle: z.boolean(),
  external: z.array(z.string()),
  define: z.record(z.string()),
  platform: z.enum(['node', 'browser']),
  target: z.string(),
  treeShaking: z.boolean(),
  splitting: z.boolean(),
  metafile: z.boolean(),
  watch: z.boolean(),
})

export type BuildConfig = z.infer<typeof BuildConfigSchema>

/**
 * Load the DyneMCP configuration file (async)
 */
export async function loadConfig(
  configPath: string = PATHS.DEFAULT_CONFIG
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

    const configContent = await fs.readFile(absolutePath, 'utf-8')
    const config: unknown = JSON.parse(configContent)

    return DyneMCPConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid configuration: ${JSON.stringify(error.errors)}`)
    } else {
      throw new Error(`Failed to load configuration: ${error}`)
    }
  }
}

/**
 * Get build configuration from DyneMCP config
 */
export function getBuildConfig(config: DyneMCPConfig): BuildConfig {
  const defaultBuildConfig: BuildConfig = {
    entryPoint: './src/index.ts',
    outDir: `./${PATHS.BUILD_OUTPUT_DIR}`,
    outFile: PATHS.BUILD_OUTPUT_FILE,
    format: 'cjs',
    minify: false,
    sourcemap: true,
    bundle: false,
    external: [],
    define: {},
    platform: 'node',
    target: 'node16',
    treeShaking: false,
    splitting: false,
    metafile: false,
    watch: false,
  }

  if (!config.build) {
    return defaultBuildConfig
  }

  return {
    ...defaultBuildConfig,
    ...config.build,
  }
}

/**
 * Create a default DyneMCP configuration
 */
export function createDefaultConfig(
  name: string,
  version = '1.0.0'
): DyneMCPConfig {
  return {
    server: {
      name,
      version,
    },
    description: `A Model Context Protocol (MCP) server named ${name}`,
    tools: {
      enabled: true,
      directory: PATHS.TOOLS_DIR,
      pattern: PATHS.FILE_PATTERNS.TYPESCRIPT,
    },
    resources: {
      enabled: true,
      directory: PATHS.RESOURCES_DIR,
      pattern: PATHS.FILE_PATTERNS.TYPESCRIPT,
    },
    prompts: {
      enabled: true,
      directory: PATHS.PROMPTS_DIR,
      pattern: PATHS.FILE_PATTERNS.TYPESCRIPT,
    },
    transport: {
      type: CLI.TRANSPORT_TYPES[0], // 'stdio'
    },
    logging: {
      enabled: true,
      level: 'info',
      format: 'text',
      timestamp: true,
      colors: true,
    },
    debug: {
      enabled: false,
      verbose: false,
      showComponentDetails: false,
      showTransportDetails: false,
    },
    performance: {
      maxConcurrentRequests: 100,
      requestTimeout: 30000,
      memoryLimit: '512mb',
      enableMetrics: false,
    },
    security: {
      enableValidation: true,
      strictMode: false,
      allowedOrigins: ['*'],
      rateLimit: {
        enabled: false,
        maxRequests: 100,
        windowMs: 900000,
      },
    },
    config: {
      env: true,
    },
    build: {
      entryPoint: './src/index.ts',
      outDir: `./${PATHS.BUILD_OUTPUT_DIR}`,
      outFile: PATHS.BUILD_OUTPUT_FILE,
      format: 'cjs',
      minify: false,
      sourcemap: true,
      bundle: false,
      external: [],
      define: {},
      platform: 'node',
      target: 'node16',
      treeShaking: false,
      splitting: false,
      metafile: false,
      watch: false,
    },
  }
}

/**
 * Validate build configuration
 */
export function validateBuildConfig(config: BuildConfig): void {
  try {
    BuildConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid build configuration: ${JSON.stringify(error.errors)}`
      )
    } else {
      throw new Error(`Failed to validate build configuration: ${error}`)
    }
  }
}

export default {
  loadConfig,
  getBuildConfig,
  createDefaultConfig,
  validateBuildConfig,
}
