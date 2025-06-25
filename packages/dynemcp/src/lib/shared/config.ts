/**
 * Shared configuration utilities
 */

import { z } from 'zod'
import { PATHS } from '../../config.js'

// Base configuration schema
export const BaseConfigSchema = z.object({
  server: z.object({
    name: z.string(),
    version: z.string(),
  }),
  description: z.string().optional(),
})

export type BaseConfig = z.infer<typeof BaseConfigSchema>

/**
 * Load base configuration
 */
export function loadBaseConfig(
  configPath: string = PATHS.DEFAULT_CONFIG
): BaseConfig {
  try {
    const fs = require('fs')
    const path = require('path')

    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath)

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Configuration file not found: ${absolutePath}`)
    }

    const configContent = fs.readFileSync(absolutePath, 'utf-8')
    const config: unknown = JSON.parse(configContent)

    return BaseConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid configuration:', error.errors)
    } else {
      console.error('Failed to load configuration:', error)
    }
    process.exit(1)
  }
}
