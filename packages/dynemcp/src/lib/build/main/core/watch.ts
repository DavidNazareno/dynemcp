// core/watch.ts
// Watch mode logic for DyneMCP build
// ----------------------------------
//
// - Provides the watch mode entrypoint for DyneMCP projects.
// - Enables hot-reloading and rebuilds on file changes for development.
// - Uses the bundler in watch mode and returns the build context.

import { type BuildContext } from 'esbuild'
import type { DyneMCPBuildOptions } from './interfaces'
import { bundleWatch } from '../../bundler'
import type { BundleOptions } from '../../bundler/'
import { ConsoleLogger } from '../../../../global/logger'
import { DEFAULT_BUILD_CONFIG } from '../../config/core/default'

/**
 * Build a DyneMCP project in watch mode.
 * This function enables hot-reloading and rebuilds on file changes.
 *
 * @param options DyneMCPBuildOptions (optional)
 * @returns BuildContext from esbuild
 */
export async function watch(
  options: DyneMCPBuildOptions & { transportType?: string }
): Promise<BuildContext> {
  const logger = options.logger ?? new ConsoleLogger()

  logger.info('👀 Starting DyneMCP build in watch mode...')
  try {
    const buildConfig = DEFAULT_BUILD_CONFIG
    const finalOptions = {
      ...buildConfig,
      ...options,
      sourcemap: true,
    } as BundleOptions & { outDir: string; outFile: string }
    const ctx = await bundleWatch(finalOptions)
    logger.success('👀 Watching for changes...')

    logger.info(`📁 Output: ${finalOptions.outDir}/${finalOptions.outFile}`)
    return ctx
  } catch (error) {
    const logger = options.logger ?? new ConsoleLogger()
    const message = error instanceof Error ? error.message : String(error)

    logger.error(`❌ Watch build failed: ${message}`)
    throw error
  }
}
