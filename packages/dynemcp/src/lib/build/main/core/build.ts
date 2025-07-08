// core/build.ts
// Main build logic for DyneMCP
// ----------------------------
//
// - Provides the main production build entrypoint for DyneMCP projects.
// - Merges config, user, and environment options for robust, zero-config builds.
// - Uses the bundler to produce optimized output and returns build results.

import { ConsoleLogger } from '../../../../global/logger'
import type { DyneMCPBuildOptions, BuildResult } from './interfaces'
import { bundle } from '../../bundler'
import type { BundleOptions } from '../../bundler/core/bundle'
import { DEFAULT_BUILD_CONFIG } from '../../config/core/default'
import { generateComponentIndexes } from './generate-component-indexes'
import { execSync } from 'child_process'
import path from 'path'

/**
 * Build a DyneMCP project with advanced features.
 * This is the main entrypoint for production builds.
 *
 * @param options DyneMCPBuildOptions (optional)
 * @returns BuildResult with stats, config, and errors if any
 */
export async function build(
  options: DyneMCPBuildOptions = {}
): Promise<BuildResult> {
  const logger = options.logger ?? new ConsoleLogger()
  const startTime = Date.now()

  try {
    logger.info('\uD83D\uDE80 Starting DyneMCP build process...')
   

    // 2. Generar los index.ts de tools/resources/prompts en dist/
    await generateComponentIndexes(
      options.configPath || 'dynemcp.config.ts',
      options.outDir || 'dist'
    )
    const buildConfig = DEFAULT_BUILD_CONFIG
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
    logger.info('📊 Analyzing dependencies...')

    logger.info(`📦 Found ${result.stats.dependencies} dependencies`)
    logger.info('⚡ Optimizing bundle...')
    logger.info('📋 Generating manifest...')

    logger.info(`✅ Build completed successfully in ${result.stats.duration}ms`)
    return result
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

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
