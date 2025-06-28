// core/build-cli.ts
// Build logic for DyneMCP CLI tool
// -------------------------------

import type { DyneMCPBuildOptions, BuildResult } from './interfaces.js'
import { getBuildConfig } from '../../config/index.js'
import { bundleCli, type BundleOptions } from '../../bundler/index.js'

/**
 * Build a DyneMCP CLI tool.
 * This function builds the CLI entrypoint for DyneMCP projects.
 */
export async function buildCli(
  options: DyneMCPBuildOptions = {}
): Promise<BuildResult> {
  try {
    if (process.env.DYNE_MCP_STDIO_LOG_SILENT !== 'true')
      console.log('🔧 Building DyneMCP CLI tool...')
    const buildConfig = getBuildConfig()
    const finalOptions = {
      ...buildConfig,
      ...options,
      cli: true,
      watch: options.watch || false,
    } as BundleOptions & { outDir: string; outFile: string }
    const fs = await import('fs-extra')
    await fs.ensureDir(finalOptions.outDir)
    const bundleResult = await bundleCli(finalOptions)
    const result: BuildResult = {
      ...bundleResult,
      config: buildConfig,
    }
    if (bundleResult.success) {
      if (process.env.DYNE_MCP_STDIO_LOG_SILENT !== 'true')
        console.log('✅ CLI build completed successfully')
      if (process.env.DYNE_MCP_STDIO_LOG_SILENT !== 'true')
        console.log(`📁 Output directory: ${finalOptions.outDir}`)
    } else {
      if (process.env.DYNE_MCP_STDIO_LOG_SILENT !== 'true')
        console.log('❌ CLI build failed')
    }
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (process.env.DYNE_MCP_STDIO_LOG_SILENT !== 'true')
      console.log(`❌ CLI build failed: ${errorMessage}`)
    return {
      success: false,
      errors: [errorMessage],
      stats: {
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
        entryPoints: [],
        outputSize: 0,
        dependencies: 0,
      },
      config: {} as any,
    }
  }
}
