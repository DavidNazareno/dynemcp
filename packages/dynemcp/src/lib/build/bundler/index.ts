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
}

/**
 * Bundle a DyneMCP project for production
 */
export async function bundle(options: BundleOptions): Promise<BundleResult> {
  const startTime = Date.now()
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
    console.log('🔨 Starting DyneMCP build...')

    // Analyze dependencies
    if (options.analyze) {
      console.log('📊 Analyzing dependencies...')
      const analysis = await analyzeDependencies(options.entryPoint)
      result.stats.dependencies = analysis.dependencies.length
      console.log(`📦 Found ${analysis.dependencies.length} dependencies`)
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
      console.error('❌ Build failed with errors:')
      buildResult.errors.forEach((error) => console.error(`  ${error.text}`))
      return result
    }

    if (buildResult.warnings.length > 0) {
      result.warnings = buildResult.warnings.map((w) => w.text)
      console.warn('⚠️  Build completed with warnings:')
      buildResult.warnings.forEach((warning) =>
        console.warn(`  ${warning.text}`)
      )
    }

    // Optimize the bundle
    if (options.bundle && options.minify) {
      console.log('⚡ Optimizing bundle...')
      await optimizeBundle(`${options.outDir}/${options.outFile}`)
    }

    // Generate manifest if requested
    if (options.manifest && buildResult.metafile) {
      console.log('📋 Generating manifest...')
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

    console.log(`✅ Build completed successfully in ${result.stats.duration}ms`)
    console.log(`📁 Output: ${options.outDir}/${options.outFile}`)

    return result
  } catch (error) {
    const endTime = Date.now()
    result.stats.endTime = endTime
    result.stats.duration = endTime - startTime
    result.errors = [error instanceof Error ? error.message : String(error)]

    console.error('❌ Build failed:', error)
    return result
  }
}

/**
 * Bundle a DyneMCP project in watch mode
 */
export async function bundleWatch(
  options: BundleOptions
): Promise<BuildContext> {
  console.log('👀 Starting DyneMCP build in watch mode...')

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
    logLevel: 'info',
    color: true,
  }

  try {
    const ctx = await context(buildOptions)

    // Start watching
    await ctx.watch()

    console.log('👀 Watching for changes...')
    console.log(`📁 Output: ${options.outDir}/${options.outFile}`)

    return ctx
  } catch (error) {
    console.error('❌ Watch build failed:', error)
    throw error
  }
}

/**
 * Bundle a DyneMCP CLI tool
 */
export async function bundleCli(options: BundleOptions): Promise<BundleResult> {
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
      console.log(`🔧 Made CLI executable: ${cliPath}`)
    } catch (error) {
      console.warn('⚠️  Could not make CLI executable:', error)
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
    await fs.remove(absoluteOutDir)
    console.log(`🧹 Cleaned build directory: ${absoluteOutDir}`)
  } catch (error) {
    console.warn('⚠️  Could not clean build directory:', error)
  }
}

export default {
  bundle,
  bundleWatch,
  bundleCli,
  cleanBuildDir,
}
