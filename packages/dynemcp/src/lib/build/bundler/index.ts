/**
 * Advanced bundler module for DyneMCP projects
 * Based on esbuild with optimizations for MCP servers
 */

import {
  build,
  context,
  type BuildOptions as EsbuildBuildOptions,
  type BuildContext,
} from 'esbuild'
import type { BuildConfig } from '../config/index.js'
import { analyzeDependencies } from './analyzer.js'
import { optimizeBundle } from './optimizer.js'
import { generateManifest } from './manifest.js'
import { ConsoleLogger, type Logger } from '../../cli/index.js'

export interface BundleResult {
  success: boolean
  outputFiles?: string[]
  metafile?: any
  errors?: string[]
  warnings?: string[]
  stats: {
    startTime: number
    endTime: number
    duration: number
    entryPoints: string[]
    outputSize: number
    dependencies: number
  }
}

export interface BundleOptions extends BuildConfig {
  watch: boolean
  analyze?: boolean
  manifest?: boolean
  cli?: boolean
  logger?: Logger
}

/**
 * Bundle a DyneMCP project for production
 */
export async function bundle(options: BundleOptions): Promise<BundleResult> {
  const startTime = Date.now()
  const logger = options.logger ?? new ConsoleLogger()
  const result: BundleResult = {
    success: false,
    stats: {
      startTime,
      endTime: 0,
      duration: 0,
      entryPoints: [],
      outputSize: 0,
      dependencies: 0,
    },
  }

  try {
    logger.info('🔨 Starting DyneMCP build...')

    // Analyze dependencies
    if (options.analyze) {
      logger.info('📊 Analyzing dependencies...')
      const analysis = await analyzeDependencies(options.entryPoint)
      result.stats.dependencies = analysis.dependencies.length
      logger.info(`📦 Found ${analysis.dependencies.length} dependencies`)
    }

    // Prepare esbuild options
    const buildOptions: EsbuildBuildOptions = {
      entryPoints: [options.entryPoint],
      outfile: `${options.outDir}/${options.outFile}`,
      bundle: options.bundle,
      minify: options.minify,
      sourcemap: options.sourcemap,
      format: options.format as 'esm' | 'cjs' | 'iife',
      platform: options.platform,
      target: options.target,
      external: options.external,
      define: {
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'production'
        ),
        ...options.define,
      },
      treeShaking: options.treeShaking,
      splitting: options.splitting,
      metafile: options.metafile,
      write: true,
      logLevel: 'info',
      color: true,
    }

    // Add MCP-specific optimizations
    if (options.bundle) {
      buildOptions.define = {
        ...buildOptions.define,
        // Optimize for MCP server environment
        'process.env.MCP_SERVER': 'true',
        // Disable debug features in production
        'process.env.DEBUG': 'false',
      }
    }

    // Build the project
    const buildResult = await build(buildOptions)

    // Process results
    if (buildResult.errors.length > 0) {
      result.errors = buildResult.errors.map((e) => e.text)
      logger.error('❌ Build failed with errors:')
      buildResult.errors.forEach((error) => logger.error(`  ${error.text}`))
      return result
    }

    if (buildResult.warnings.length > 0) {
      result.warnings = buildResult.warnings.map((w) => w.text)
      logger.warn('⚠️  Build completed with warnings:')
      buildResult.warnings.forEach((warning) =>
        logger.warn(`  ${warning.text}`)
      )
    }

    // Optimize the bundle
    if (options.bundle && options.minify) {
      logger.info('⚡ Optimizing bundle...')
      await optimizeBundle(`${options.outDir}/${options.outFile}`)
    }

    // Generate manifest if requested
    if (options.manifest && buildResult.metafile) {
      logger.info('📋 Generating manifest...')
      await generateManifest(buildResult.metafile, options.outDir)
    }

    // Calculate stats
    const endTime = Date.now()
    result.stats.endTime = endTime
    result.stats.duration = endTime - startTime
    result.stats.entryPoints = [options.entryPoint]
    result.outputFiles = buildResult.outputFiles?.map((f) => f.path) || []
    result.metafile = buildResult.metafile
    result.success = true

    logger.success(
      `✅ Build completed successfully in ${result.stats.duration}ms`
    )
    logger.info(`📁 Output: ${options.outDir}/${options.outFile}`)

    return result
  } catch (error) {
    const endTime = Date.now()
    result.stats.endTime = endTime
    result.stats.duration = endTime - startTime
    result.errors = [error instanceof Error ? error.message : String(error)]

    logger.error(`❌ Build failed: ${error}`)
    return result
  }
}

/**
 * Bundle a DyneMCP project in watch mode
 */
export async function bundleWatch(
  options: BundleOptions
): Promise<BuildContext> {
  const logger = options.logger ?? new ConsoleLogger()
  logger.info('👀 Starting DyneMCP build in watch mode...')

  const buildOptions: EsbuildBuildOptions = {
    entryPoints: [options.entryPoint],
    outfile: `${options.outDir}/${options.outFile}`,
    bundle: options.bundle,
    minify: options.minify,
    sourcemap: true, // Always enable sourcemap in watch mode
    format: options.format,
    platform: options.platform,
    target: options.target,
    external: options.external,
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      ...options.define,
    },
    treeShaking: options.treeShaking,
    splitting: options.splitting,
    metafile: false, // Disable metafile in watch mode for performance
    write: true,
    logLevel: 'silent',
    color: true,
    plugins: [
      {
        name: 'dynemcp-watch-reporter',
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length > 0) {
              logger.error('❌ Watch build failed:')
              result.errors.forEach((error) => {
                logger.error(`  ${error.text}`)
              })
            } else {
              logger.success('✅ Watch build succeeded.')
              if (result.warnings.length > 0) {
                logger.warn('⚠️  Build completed with warnings:')
                result.warnings.forEach((warning) => {
                  logger.warn(`  ${warning.text}`)
                })
              }
            }
          })
        },
      },
    ],
  }

  try {
    const ctx = await context(buildOptions)

    // Start watching
    await ctx.watch()

    logger.info('👀 Watching for changes...')
    logger.info(`📁 Output: ${options.outDir}/${options.outFile}`)

    return ctx
  } catch (error) {
    logger.error(`❌ Watch build failed: ${error}`)
    throw error
  }
}

/**
 * Bundle a DyneMCP CLI tool
 */
export async function bundleCli(options: BundleOptions): Promise<BundleResult> {
  const logger = options.logger ?? new ConsoleLogger()
  const cliOptions: BundleOptions = {
    ...options,
    outFile: options.outFile.replace('.js', '-cli.js'),
    define: {
      ...options.define,
      'process.env.CLI_MODE': 'true',
    },
  }

  const result = await bundle(cliOptions)

  if (result.success) {
    // Make the CLI executable
    const fs = await import('fs')
    const path = await import('path')
    const cliPath = path.join(options.outDir, cliOptions.outFile)

    try {
      fs.chmodSync(cliPath, '755')
      logger.info(`🔧 Made CLI executable: ${cliPath}`)
    } catch (error) {
      logger.warn(`⚠️  Could not make CLI executable: ${error}`)
    }
  }

  return result
}

/**
 * Clean build directory
 */
export async function cleanBuildDir(outDir: string): Promise<void> {
  const fs = await import('fs-extra')
  const path = await import('path')

  const absoluteOutDir = path.isAbsolute(outDir)
    ? outDir
    : path.join(process.cwd(), outDir)

  try {
    if (fs.existsSync(absoluteOutDir)) {
      await fs.rm(absoluteOutDir, { recursive: true, force: true })
    }
  } catch (error) {
    console.error(`❌ Error cleaning directory ${absoluteOutDir}:`, error)
  }
}

export default {
  bundle,
  bundleWatch,
  bundleCli,
  cleanBuildDir,
}
