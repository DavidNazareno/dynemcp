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
    // Merge de opciones: usuario > env > defaults
    const finalOptions = {
      ...buildConfig,
      ...options,
      // Las siguientes opciones pueden venir de env o del usuario
      external: options.external ?? buildConfig.external,
      minify:
        typeof options.minify === 'boolean'
          ? options.minify
          : buildConfig.minify,
      sourcemap:
        typeof options.sourcemap === 'boolean'
          ? options.sourcemap
          : buildConfig.sourcemap,
      target: options.target || buildConfig.target,
      format: options.format || buildConfig.format,
      bundle:
        typeof options.bundle === 'boolean'
          ? options.bundle
          : buildConfig.bundle,
      treeShaking:
        typeof options.treeShaking === 'boolean'
          ? options.treeShaking
          : buildConfig.treeShaking,
      splitting:
        typeof options.splitting === 'boolean'
          ? options.splitting
          : buildConfig.splitting,
      metafile:
        typeof options.metafile === 'boolean'
          ? options.metafile
          : buildConfig.metafile,
      watch: options.watch || false,
    } as BundleOptions & { outDir: string; outFile: string }
    const bundleResult = await bundle(finalOptions)
    const result: BuildResult = {
      ...bundleResult,
      config: {
        ...buildConfig,
        format: finalOptions.format as 'cjs' | 'esm' | 'iife',
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
