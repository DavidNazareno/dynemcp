/**
 * Dependency analyzer for DyneMCP projects
 */

import { build } from 'esbuild';
import type { Metafile } from 'esbuild';

export interface DependencyAnalysis {
  dependencies: string[];
  size: number;
  modules: number;
  chunks: number;
}

/**
 * Analyze project dependencies using esbuild metafile
 */
export async function analyzeDependencies(entryPoint: string): Promise<DependencyAnalysis> {
  try {
    const result = await build({
      entryPoints: [entryPoint],
      bundle: true,
      write: false,
      metafile: true,
      format: 'esm',
      platform: 'node',
      target: 'node16',
    });

    if (!result.metafile) {
      throw new Error('Failed to generate metafile for analysis');
    }

    const metafile = result.metafile as Metafile;
    const dependencies = new Set<string>();
    let totalSize = 0;
    let moduleCount = 0;

    // Analyze inputs (source files)
    for (const [path, info] of Object.entries(metafile.inputs)) {
      if (path.startsWith('node_modules/')) {
        const packageName = path.split('/')[1];
        dependencies.add(packageName);
      }
      moduleCount++;
      totalSize += info.bytes;
    }

    // Analyze outputs (bundled files)
    const chunkCount = Object.keys(metafile.outputs).length;

    return {
      dependencies: Array.from(dependencies).sort(),
      size: totalSize,
      modules: moduleCount,
      chunks: chunkCount,
    };
  } catch (error) {
    console.warn('⚠️  Could not analyze dependencies:', error);
    return {
      dependencies: [],
      size: 0,
      modules: 0,
      chunks: 0,
    };
  }
}

/**
 * Generate dependency report
 */
export function generateDependencyReport(analysis: DependencyAnalysis): string {
  const sizeKB = (analysis.size / 1024).toFixed(2);
  const sizeMB = (analysis.size / (1024 * 1024)).toFixed(2);

  let report = `📊 Dependency Analysis Report\n`;
  report += `================================\n`;
  report += `📦 Dependencies: ${analysis.dependencies.length}\n`;
  report += `📁 Modules: ${analysis.modules}\n`;
  report += `🧩 Chunks: ${analysis.chunks}\n`;
  report += `💾 Size: ${sizeKB} KB (${sizeMB} MB)\n`;

  if (analysis.dependencies.length > 0) {
    report += `\n📋 Dependencies:\n`;
    analysis.dependencies.forEach((dep) => {
      report += `  - ${dep}\n`;
    });
  }

  return report;
}

export default {
  analyzeDependencies,
  generateDependencyReport,
};
