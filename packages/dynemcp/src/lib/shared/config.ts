/**
 * Shared configuration utilities
 */

import { z } from 'zod'
import { promises as fs } from 'fs'
import * as path from 'path'
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
 * Load base configuration (async)
 */
export async function loadBaseConfig(
  configPath: string = PATHS.DEFAULT_CONFIG
): Promise<BaseConfig> {
  try {
    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath)

    try {
      await fs.access(absolutePath)
    } catch {
      throw new Error(`Configuration file not found: ${absolutePath}`)
    }

    const configContent = await fs.readFile(absolutePath, 'utf-8')
    const config: unknown = JSON.parse(configContent)

    return BaseConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid configuration: ${JSON.stringify(error.errors)}`)
    } else {
      throw new Error(`Failed to load configuration: ${error}`)
    }
  }
}
