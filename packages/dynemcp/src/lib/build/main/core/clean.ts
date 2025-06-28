// core/clean.ts
// Clean logic for DyneMCP build output directory
// ----------------------------------------------

import { loadConfig, getBuildConfig } from '../../config/index.js'
import { cleanBuildDir } from '../../bundler/index.js'

/**
 * Clean the build output directory.
 * Removes the output directory before a new build.
 */
export async function clean(
  options: { outDir?: string; configPath?: string } = {}
): Promise<void> {
  const config = options.configPath
    ? await loadConfig(options.configPath)
    : undefined
  const outDir = options.outDir || (config ? getBuildConfig().outDir : 'dist')
  await cleanBuildDir(outDir)
}
