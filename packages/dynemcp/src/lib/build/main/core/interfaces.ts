// interfaces.ts
// Public types and contracts for DyneMCP main build
// --------------------------------------------------
//
// - Defines the main types and interfaces for the DyneMCP build system.
// - Includes BuildConfig, DyneMCPBuildOptions, and BuildResult for type safety and extensibility.

// Inline BuildConfig type based on DEFAULT_BUILD_CONFIG
export interface BuildConfig {
  entryPoint: string
  outDir: string
  outFile: string
  format: 'esm' | 'cjs' | 'iife'
  minify: boolean
  sourcemap: boolean
  bundle: boolean
  external: string[]
  define: Record<string, string>
  platform: 'node' | 'browser'
  target: string
  treeShaking: boolean
  splitting: boolean
  metafile: boolean
  watch: boolean
}

import type { BundleResult } from '../../bundler'

/**
 * Options for building a DyneMCP project.
 */
export interface DyneMCPBuildOptions {
  configPath?: string
  clean?: boolean
  analyze?: boolean
  manifest?: boolean
  html?: boolean
  watch?: boolean
  cli?: boolean
  // Advanced options (can override config)
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
  logger?: any // Use Logger from CLI if needed
}

/**
 * Result of a DyneMCP build.
 */
export interface BuildResult extends BundleResult {
  config: BuildConfig
  analysis?: any
}
