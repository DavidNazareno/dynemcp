// core/clean.ts
// Clean logic for DyneMCP build output directory
// ----------------------------------------------
//
// - Provides the clean entrypoint for DyneMCP projects.
// - Removes the build output directory before a new build.
// - Ensures a fresh build environment.

import { loadConfig, getBuildConfig } from '../../config'
import { cleanBuildDir } from '../../bundler'

/**
 * Clean the build output directory.
 * Removes the output directory before a new build.
 *
 * @param options Optional: outDir and configPath
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
