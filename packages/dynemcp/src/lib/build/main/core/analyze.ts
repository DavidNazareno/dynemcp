// core/analyze.ts
// Dependency analysis logic for DyneMCP
// -------------------------------------

import { analyzeDependencies } from '../../bundler/index.js'

/**
 * Analyze the project dependencies.
 * Returns a dependency analysis report for the given entry point.
 */
export async function analyze(
  options: { entryPoint?: string; configPath?: string } = {}
): Promise<any> {
  const entry = options.entryPoint
  if (!entry) throw new Error('No entryPoint specified for analysis')
  const analysis = await analyzeDependencies(entry)
  return analysis
}
