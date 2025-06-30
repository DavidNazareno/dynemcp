// core/watch.ts
// Watch mode logic for DyneMCP build
// ----------------------------------

import { type BuildContext } from 'esbuild'
import type { DyneMCPBuildOptions } from './interfaces'
import { getBuildConfig } from '../../config'
import { bundleWatch } from '../../bundler'
import type { BundleOptions } from '../../bundler/'
import { ConsoleLogger } from '../../../cli/core/logger'

function shouldLog() {
  return !process.env.DYNE_MCP_STDIO_LOG_SILENT
}

/**
 * Build a DyneMCP project in watch mode.
 * This function enables hot-reloading and rebuilds on file changes.
 */
export async function watch(
  options: DyneMCPBuildOptions = {}
): Promise<BuildContext> {
  const logger = options.logger ?? new ConsoleLogger()
  if (shouldLog()) logger.info('👀 Starting watch mode...')
  try {
    const buildConfig = getBuildConfig()
    const finalOptions = {
      ...buildConfig,
      ...options,
      sourcemap: true,
    } as BundleOptions & { outDir: string; outFile: string }
    const ctx = await bundleWatch(finalOptions)
    if (shouldLog()) logger.success('👀 Watching for changes...')
    if (shouldLog())
      logger.info(`📁 Output: ${finalOptions.outDir}/${finalOptions.outFile}`)
    return ctx
  } catch (error) {
    const logger = options.logger ?? new ConsoleLogger()
    const message = error instanceof Error ? error.message : String(error)
    if (shouldLog()) logger.error(`❌ Watch build failed: ${message}`)
    throw error
  }
}
