/**
 * Advanced builder module for DyneMCP projects
 * Based on esbuild with optimizations for MCP servers
 */

import { type BuildContext } from 'esbuild'
import {
  loadConfig,
  getBuildConfig,
  validateBuildConfig,
  type BuildConfig,
} from './config/index.js'
import {
  bundle,
  bundleWatch,
  bundleCli,
  cleanBuildDir,
  type BundleResult,
  type BundleOptions,
} from './bundler/index.js'
import {
  analyzeDependencies,
  generateDependencyReport,
} from './bundler/analyzer.js'
import { generateBundleStats } from './bundler/optimizer.js'
import { generateHTMLReport } from './bundler/manifest.js'
import { ConsoleLogger, type Logger } from '../cli/index.js'

export interface DyneMCPBuildOptions {
  configPath?: string
  clean?: boolean
  analyze?: boolean
  manifest?: boolean
  html?: boolean
  watch?: boolean
  cli?: boolean
  // Optional build options that can override config
  entryPoint?: string
  outDir?: string
  outFile?: string
  format?: 'esm' | 'cjs' | 'iife'
  minify?: boolean
  sourcemap?: boolean
  bundle?: boolean
  external?: string[]
  define?: Record<string, string>
  platform?: 'node' | 'browser'
  target?: string
  treeShaking?: boolean
  splitting?: boolean
  metafile?: boolean
  logger?: Logger
}

export interface BuildResult extends BundleResult {
  config: BuildConfig
  analysis?: any
}

function shouldLog() {
  return !process.env.DYNE_MCP_STDIO_LOG_SILENT
}

/**
 * Build a DyneMCP project with advanced features
 */
export async function build(
  options: DyneMCPBuildOptions = {}
): Promise<BuildResult> {
  const logger = options.logger ?? new ConsoleLogger()
  const startTime = Date.now()

  try {
    if (shouldLog()) logger.info('🚀 Starting DyneMCP build process...')

    const config = await loadConfig(options.configPath)
    const buildConfig = getBuildConfig(config)

    const finalOptions: BundleOptions = {
      ...buildConfig,
      ...options,
      watch: options.watch || false,
    }

    validateBuildConfig(finalOptions)

    if (options.clean) {
      await cleanBuildDir(finalOptions.outDir)
    }

    const fs = await import('fs-extra')
    await fs.ensureDir(finalOptions.outDir)

    const bundleResult = await bundle(finalOptions)

    const result: BuildResult = {
      ...bundleResult,
      config: buildConfig,
    }

    if (options.analyze && bundleResult.success) {
      if (shouldLog()) logger.info('📊 Analyzing dependencies...')
      const analysis = await analyzeDependencies(finalOptions.entryPoint)
      result.analysis = analysis

      const report = generateDependencyReport(analysis)
      if (shouldLog()) logger.info(report)

      const reportPath = `${finalOptions.outDir}/dependency-analysis.txt`
      await fs.writeFile(reportPath, report)
      if (shouldLog())
        logger.info(`📋 Dependency analysis saved: ${reportPath}`)
    }

    if (bundleResult.success && bundleResult.outputFiles?.[0]) {
      const bundleStats = generateBundleStats(bundleResult.outputFiles[0])
      result.stats = {
        ...result.stats,
        outputSize: bundleStats.size,
      }
      if (shouldLog())
        logger.info(
          `📈 Bundle stats: ${bundleStats.sizeKB}KB, ${bundleStats.lines} lines`
        )
    }

    if (options.html && bundleResult.metafile) {
      await generateHTMLReport(bundleResult.metafile, finalOptions.outDir)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    if (bundleResult.success) {
      if (shouldLog())
        logger.success(`✅ Build completed successfully in ${duration}ms`)
      if (shouldLog())
        logger.info(`📁 Output directory: ${finalOptions.outDir}`)
      if (bundleResult.outputFiles) {
        bundleResult.outputFiles.forEach((file) => {
          if (shouldLog()) logger.info(`📄 Generated: ${file}`)
        })
      }
    } else {
      if (shouldLog()) logger.error(`❌ Build failed after ${duration}ms`)
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
      config: {} as BuildConfig,
    }
  }
}

/**
 * Build a DyneMCP project in watch mode
 */
export async function watch(
  options: DyneMCPBuildOptions = {}
): Promise<BuildContext> {
  const logger = options.logger ?? new ConsoleLogger()
  if (shouldLog()) logger.info('👀 Starting watch mode...')

  try {
    const config = await loadConfig(options.configPath)
    const buildConfig = getBuildConfig(config)

    const finalOptions: BuildConfig = {
      ...buildConfig,
      ...options,
    }
    finalOptions.sourcemap = true

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

/**
 * Build a DyneMCP CLI tool
 */
export async function buildCli(
  options: DyneMCPBuildOptions = {}
): Promise<BuildResult> {
  try {
    if (shouldLog()) console.log('🔧 Building DyneMCP CLI tool...')

    // Load configuration
    const config = loadConfig(options.configPath)
    const buildConfig = getBuildConfig(config)

    // Merge options with config
    const finalOptions: BundleOptions = {
      ...buildConfig,
      ...options,
      cli: true,
      watch: options.watch || false,
    }

    // Validate configuration
    validateBuildConfig(finalOptions)

    // Clean build directory if requested
    if (options.clean) {
      await cleanBuildDir(finalOptions.outDir)
    }

    // Create output directory
    const fs = await import('fs-extra')
    await fs.ensureDir(finalOptions.outDir)

    // Build CLI
    const bundleResult = await bundleCli(finalOptions)

    const result: BuildResult = {
      ...bundleResult,
      config: buildConfig,
    }

    if (bundleResult.success) {
      if (shouldLog()) console.log('✅ CLI build completed successfully')
      if (shouldLog())
        console.log(
          `🔧 CLI executable: ${finalOptions.outDir}/${finalOptions.outFile.replace(
            '.js',
            '-cli.js'
          )}`
        )
    } else {
      if (shouldLog()) console.error('❌ CLI build failed')
    }

    return result
  } catch (error) {
    if (shouldLog()) console.error('❌ CLI build failed:', error)

    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
      stats: {
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
        entryPoints: [],
        outputSize: 0,
        dependencies: 0,
      },
      config: {} as BuildConfig,
    }
  }
}

/**
 * Clean build directory
 */
export async function clean(
  options: { outDir?: string; configPath?: string } = {}
): Promise<void> {
  try {
    let outDir = options.outDir || './dist'

    if (!options.outDir && options.configPath) {
      const config = loadConfig(options.configPath)
      const buildConfig = getBuildConfig(config)
      outDir = buildConfig.outDir
    }

    await cleanBuildDir(outDir)
  } catch (error) {
    if (shouldLog()) console.error('❌ Clean failed:', error)
    throw error
  }
}

/**
 * Analyze project dependencies
 */
export async function analyze(
  options: { entryPoint?: string; configPath?: string } = {}
): Promise<any> {
  try {
    let entryPoint = options.entryPoint || './src/index.ts'

    if (!options.entryPoint && options.configPath) {
      const config = loadConfig(options.configPath)
      const buildConfig = getBuildConfig(config)
      entryPoint = buildConfig.entryPoint
    }

    if (shouldLog()) console.log('📊 Analyzing project dependencies...')
    const analysis = await analyzeDependencies(entryPoint)
    const report = generateDependencyReport(analysis)

    if (shouldLog()) console.log(report)
    return analysis
  } catch (error) {
    if (shouldLog()) console.error('❌ Analysis failed:', error)
    throw error
  }
}

export default {
  build,
  watch,
  buildCli,
  clean,
  analyze,
}
