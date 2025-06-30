// core/build.ts
// Main build logic for DyneMCP
// ----------------------------

import { ConsoleLogger } from '../../../cli/core/logger'
import type { DyneMCPBuildOptions, BuildResult } from './interfaces'
import { getBuildConfig } from '../../config'
import { bundle } from '../../bundler'
import type { BundleOptions } from '../../bundler/core/bundle'

function shouldLog() {
  return !process.env.DYNE_MCP_STDIO_LOG_SILENT
}

/**
 * Build a DyneMCP project with advanced features.
 * This is the main entrypoint for production builds.
 */
export async function build(
  options: DyneMCPBuildOptions = {}
): Promise<BuildResult> {
  const logger = options.logger ?? new ConsoleLogger()
  const startTime = Date.now()

  try {
    if (shouldLog()) logger.info('🚀 Starting DyneMCP build process...')
    const buildConfig = getBuildConfig()
    // Only the main build logic, no analysis or CLI helpers here
    const finalOptions = {
      ...buildConfig,
      ...options,
      watch: options.watch || false,
    } as BundleOptions & { outDir: string; outFile: string }
    const bundleResult = await bundle(finalOptions)
    const result: BuildResult = {
      ...bundleResult,
      config: {
        ...buildConfig,
        format: buildConfig.format as 'cjs' | 'esm' | 'iife',
        platform: buildConfig.platform as 'node' | 'browser',
      },
    }
    return result
  } catch (error) {
    const logger = options.logger ?? new ConsoleLogger()
    const endTime = Date.now()
    const duration = endTime - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (shouldLog())
      logger.error(`❌ Build failed after ${duration}ms: ${errorMessage}`)
    return {
      success: false,
      errors: [errorMessage],
      stats: {
        startTime,
        endTime,
        duration,
        entryPoints: [],
        outputSize: 0,
        dependencies: 0,
      },
      config: {} as any,
    }
  }
}
