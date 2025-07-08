// bundle.ts
// Core bundling logic for DyneMCP projects (production, watch, CLI)
// ------------------------------------------------------------------
//
// - Handles builds, watch mode, CLI bundling, and output cleanup.
// - Integrates esbuild, dependency analysis, optimizations, and manifest generation.

import {
  build,
  context,
  type BuildOptions as EsbuildBuildOptions,
  type BuildContext,
} from 'esbuild'
import { analyzeDependencies } from './analyzer'
import { optimizeBundle } from './optimizer'
import { generateManifest } from './manifest'
import type { BuildConfig } from '../../main'
import { BUILD } from '../../../../global/config-all-contants'
import { fileLogger } from '../../../../global/logger'
import { existsSync } from 'fs'
import path from 'path'

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

function getEsbuildOptions(
  options: BundleOptions,
  isWatch = false
): EsbuildBuildOptions {
  const baseDefines = {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV ||
        (isWatch ? BUILD.ENVIRONMENT.DEV : BUILD.ENVIRONMENT.PROD)
    ),
    ...options.define,
  }

  // Detectar entrypoints adicionales
  const entryPoints = [options.entryPoint]
  const projectRoot = process.cwd()
  const outDir = options.outDir || 'dist'
  const toolIndex = path.resolve(projectRoot, outDir, 'tools/index.ts')
  const resourceIndex = path.resolve(projectRoot, outDir, 'resources/index.ts')
  const promptIndex = path.resolve(projectRoot, outDir, 'prompts/index.ts')
  if (existsSync(toolIndex)) entryPoints.push(toolIndex)
  if (existsSync(resourceIndex)) entryPoints.push(resourceIndex)
  if (existsSync(promptIndex)) entryPoints.push(promptIndex)

  return {
    entryPoints,
    outdir: outDir,
    bundle: options.bundle,
    minify: options.minify,
    sourcemap: isWatch || options.sourcemap,
    format: options.format,
    platform: options.platform,
    target: options.target,
    external: options.external,
    define: baseDefines,
    treeShaking: options.treeShaking,
    splitting: options.splitting,
    metafile: !isWatch && options.metafile,
    write: true,
    logLevel: 'info',
    color: true,
  }
}

/**
 * Clean the build output directory.
 */
export async function cleanBuildDir(outDir: string): Promise<void> {
  const fs = await import('fs-extra')
  const path = await import('path')

  const absoluteOutDir = path.isAbsolute(outDir)
    ? outDir
    : path.join(process.cwd(), outDir)

  try {
    await fs.remove(absoluteOutDir)

    fileLogger.info(`🧹 Cleaned build directory: ${absoluteOutDir}`)
  } catch (error) {
    fileLogger.warn(`⚠️  Could not clean build directory: ${error}`)
  }
}

/**
 * Bundle a DyneMCP project for production.
 */
export async function bundle(
  options: BundleOptions & { transportType?: string }
): Promise<BundleResult> {
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
    fileLogger.info('🔨 Starting DyneMCP build...')

    // Optional: Analyze dependencies
    if (options.analyze) {
      fileLogger.info('📊 Analyzing dependencies...')

      const analysis = await analyzeDependencies(options.entryPoint)
      result.stats.dependencies = analysis.dependencies.length

      fileLogger.info(`📦 Found ${analysis.dependencies.length} dependencies`)
    }

    // Build project
    const buildOptions = getEsbuildOptions(options)
    const buildResult = await build(buildOptions)

    // Errors
    if (buildResult.errors.length) {
      result.errors = buildResult.errors.map((e) => e.text)

      fileLogger.error('❌ Build failed with errors:')
      result.errors.forEach((e) => fileLogger.error(`  ${e}`))

      return result
    }

    // Warnings
    if (buildResult.warnings.length) {
      result.warnings = buildResult.warnings.map((w) => w.text)

      fileLogger.warn('⚠️  Build completed with warnings:')
      result.warnings.forEach((w) => fileLogger.warn(`  ${w}`))
    }

    // Optional: Optimize bundle
    if (options.bundle && options.minify) {
      // Optimizar todos los outputs generados
      if (buildResult.outputFiles) {
        for (const f of buildResult.outputFiles) {
          await optimizeBundle(f.path)
        }
      }
    }

    // Optional: Generate manifest
    if (options.manifest && buildResult.metafile) {
      fileLogger.info('📋 Generating manifest...')
      await generateManifest(buildResult.metafile, options.outDir)
    }

    const endTime = Date.now()
    result.stats = {
      ...result.stats,
      endTime,
      duration: endTime - startTime,
      entryPoints: Array.isArray(buildOptions.entryPoints)
        ? buildOptions.entryPoints.map((e: any) =>
            typeof e === 'string' ? e : e.in || ''
          )
        : [],
    }
    // Recoger outputs
    if (buildResult.outputFiles) {
      result.outputFiles = buildResult.outputFiles.map((f) => f.path)
    } else if (buildResult.outputFiles == null && buildResult.metafile) {
      // Si no hay outputFiles, usar metafile para listar outputs
      result.outputFiles = Object.keys(buildResult.metafile.outputs)
    }
    result.metafile = buildResult.metafile
    result.success = true

    fileLogger.info(
      `✅ Build completed successfully in ${result.stats.duration}ms`
    )
    fileLogger.info(`📁 Outputs: ${(result.outputFiles || []).join(', ')}`)

    return result
  } catch (error) {
    result.stats.endTime = Date.now()
    result.stats.duration = result.stats.endTime - startTime
    result.errors = [error instanceof Error ? error.message : String(error)]

    fileLogger.error(`❌ Build failed: ${error}`)

    return result
  }
}

/**
 * Bundle a DyneMCP project in watch mode.
 */
export async function bundleWatch(
  options: BundleOptions
): Promise<BuildContext> {
  fileLogger.info('👀 Starting DyneMCP build in watch mode...')

  const ctx = await context(getEsbuildOptions(options, true))
  await ctx.watch()

  fileLogger.info('👀 Watching for changes...')
  fileLogger.info(`📁 Output: ${options.outDir}/${options.outFile}`)

  return ctx
}

/**
 * Bundle a DyneMCP CLI tool.
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
    const fs = await import('fs')
    const path = await import('path')
    const cliPath = path.join(options.outDir, cliOptions.outFile)

    try {
      fs.chmodSync(cliPath, '755')

      fileLogger.info(`🔧 Made CLI executable: ${cliPath}`)
    } catch (error) {
      fileLogger.warn(`⚠️  Could not make CLI executable: ${error}`)
    }
  }

  return result
}
