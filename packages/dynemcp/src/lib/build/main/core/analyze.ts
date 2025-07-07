// core/analyze.ts
// Dependency analysis logic for DyneMCP
// -------------------------------------
//
// - Provides the dependency analysis entrypoint for DyneMCP projects.
// - Analyzes project dependencies and returns a report for the given entry point.

import { analyzeDependencies } from '../../bundler'

/**
 * Analyze the project dependencies.
 * Returns a dependency analysis report for the given entry point.
 *
 * @param options entryPoint and configPath (optional)
 * @returns Dependency analysis report
 */
export async function analyze(
  options: { entryPoint?: string; configPath?: string } = {}
): Promise<any> {
  const entry = options.entryPoint
  if (!entry) throw new Error('No entryPoint specified for analysis')
  const analysis = await analyzeDependencies(entry)
  return analysis
}
