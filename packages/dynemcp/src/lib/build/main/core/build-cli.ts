// core/build-cli.ts
// Build logic for DyneMCP CLI tool
// -------------------------------
//
// - Provides the build entrypoint for the DyneMCP CLI tool.
// - Adjusts output and environment for CLI-specific builds.
// - Delegates to the main build function with CLI options.

import type { DyneMCPBuildOptions, BuildResult } from './interfaces'
import { getBuildConfig } from '../../config'
import { bundleCli, type BundleOptions } from '../../bundler'
import { build } from './build'

/**
 * Build a DyneMCP CLI tool.
 * This function builds the CLI entrypoint for DyneMCP projects.
 *
 * @param options DyneMCPBuildOptions (optional)
 * @returns BuildResult for the CLI build
 */
export async function buildCli(
  options: DyneMCPBuildOptions = {}
): Promise<BuildResult> {
  // buildCli solo ajusta el outFile y define, y delega en build
  const cliOptions = {
    ...options,
    outFile: options.outFile
      ? options.outFile.replace('.js', '-cli.js')
      : undefined,
    define: {
      ...options.define,
      'process.env.CLI_MODE': 'true',
    },
    cli: true,
  }
  return build(cliOptions)
}
