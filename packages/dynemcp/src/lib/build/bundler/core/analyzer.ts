// analyzer.ts
// Dependency analysis logic for DyneMCP projects
// ---------------------------------------------
//
// - Provides utilities for analyzing project dependencies using esbuild metafiles.
// - Returns dependency lists, size, module/chunk counts, and generates human-readable reports.

import { BUILD } from '../../../../global/config-all-contants'
import { build } from 'esbuild'
import type { Format, Metafile, Platform } from 'esbuild'

export interface DependencyAnalysis {
  dependencies: string[]
  size: number
  modules: number
  chunks: number
}

/**
 * Extract dependencies, size, and module count from esbuild metafile inputs.
 */
function extractInputData(inputs: Metafile['inputs']): {
  dependencies: Set<string>
  totalSize: number
  moduleCount: number
} {
  const dependencies = new Set<string>()
  let totalSize = 0
  let moduleCount = 0

  for (const [filePath, info] of Object.entries(inputs)) {
    if (filePath.startsWith('node_modules/')) {
      const [, pkg] = filePath.split('/')
      if (pkg) dependencies.add(pkg)
    }
    totalSize += info.bytes
    moduleCount++
  }

  return { dependencies, totalSize, moduleCount }
}

/**
 * Analyze project dependencies using esbuild metafile.
 *
 * @param entryPoint Entry file to analyze
 * @returns DependencyAnalysis with dependencies, size, modules, and chunks
 */
export async function analyzeDependencies(
  entryPoint: string
): Promise<DependencyAnalysis> {
  try {
    const result = await build({
      entryPoints: [entryPoint],
      bundle: BUILD.BUNDLE,
      write: BUILD.WRITE,
      metafile: BUILD.METAFILE,
      format: BUILD.FORMAT as Format,
      platform: BUILD.PLATFORM as Platform,
      target: BUILD.TARGET,
    })

    if (!result.metafile) {
      throw new Error('Failed to generate metafile for analysis')
    }

    const { inputs, outputs } = result.metafile
    const { dependencies, totalSize, moduleCount } = extractInputData(inputs)

    return {
      dependencies: Array.from(dependencies).sort(),
      size: totalSize,
      modules: moduleCount,
      chunks: Object.keys(outputs).length,
    }
  } catch (error) {
    console.warn('⚠️  Could not analyze dependencies:', error)
    return {
      dependencies: [],
      size: 0,
      modules: 0,
      chunks: 0,
    }
  }
}

/**
 * Generate a human-readable dependency report from analysis results.
 *
 * @param analysis DependencyAnalysis object
 * @returns String report
 */
export function generateDependencyReport(analysis: DependencyAnalysis): string {
  const formatSize = (bytes: number): string => {
    const kb = (bytes / 1024).toFixed(2)
    const mb = (bytes / 1024 / 1024).toFixed(2)
    return `${kb} KB (${mb} MB)`
  }

  const lines: string[] = [
    '📊 Dependency Analysis Report',
    '================================',
    `📦 Dependencies: ${analysis.dependencies.length}`,
    `📁 Modules: ${analysis.modules}`,
    `🗩 Chunks: ${analysis.chunks}`,
    `💾 Size: ${formatSize(analysis.size)}`,
  ]

  if (analysis.dependencies.length > 0) {
    lines.push('\n📋 Dependencies:')
    for (const dep of analysis.dependencies) {
      lines.push(`  - ${dep}`)
    }
  }

  return lines.join('\n')
}
