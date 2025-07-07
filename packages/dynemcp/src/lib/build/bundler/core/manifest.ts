// manifest.ts
// Build manifest and HTML report logic for DyneMCP projects
// --------------------------------------------------------
//
// - Generates a build manifest (JSON) from esbuild metafile for DyneMCP projects.
// - Optionally generates a human-friendly HTML build report for visualization.
// - Summarizes outputs, dependencies, and build statistics.

import { promises as fs } from 'fs'
import { join } from 'path'
import type { Metafile } from 'esbuild'
import { shouldLog } from './utils'

export interface BuildManifest {
  version: string
  timestamp: string
  entryPoints: string[]
  outputs: Record<
    string,
    { size: number; imports: string[]; exports: string[] }
  >
  dependencies: Record<string, { version: string; size: number }>
  stats: {
    totalSize: number
    totalModules: number
    totalChunks: number
  }
}

/**
 * Generate build manifest from esbuild metafile.
 *
 * @param metafile esbuild metafile
 * @param outDir Output directory for manifest
 */
export async function generateManifest(
  metafile: Metafile,
  outDir: string
): Promise<void> {
  try {
    const manifest: BuildManifest = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      entryPoints: [],
      outputs: {},
      dependencies: {},
      stats: {
        totalSize: 0,
        totalModules: 0,
        totalChunks: 0,
      },
    }

    // Process inputs (source files)
    for (const [filePath, info] of Object.entries(metafile.inputs)) {
      if (filePath.includes('node_modules/')) {
        const packageName = filePath.split('/')[1]
        if (!manifest.dependencies[packageName]) {
          manifest.dependencies[packageName] = {
            version: 'unknown',
            size: 0,
          }
        }
        manifest.dependencies[packageName].size += info.bytes
      }

      manifest.stats.totalModules++
      manifest.stats.totalSize += info.bytes
    }

    // Process outputs (bundled files)
    for (const [filePath, info] of Object.entries(metafile.outputs)) {
      manifest.outputs[filePath] = {
        size: info.bytes,
        imports: info.imports?.map((imp) => imp.path) || [],
        exports: info.exports || [],
      }
      manifest.stats.totalChunks++
    }

    // Extract entry points
    manifest.entryPoints = Object.keys(metafile.inputs).filter(
      (path) => !path.includes('node_modules/') && path.endsWith('.ts')
    )

    // Write manifest file
    const manifestPath = join(outDir, 'build-manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

    if (shouldLog()) console.log(`📋 Build manifest generated: ${manifestPath}`)
  } catch (error) {
    if (shouldLog())
      console.warn('⚠️  Could not generate build manifest:', error)
  }
}

/**
 * Generate HTML report from build manifest.
 *
 * @param manifest BuildManifest object
 * @param outDir Output directory for report
 */
export async function generateHTMLReport(
  manifest: BuildManifest,
  outDir: string
): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DyneMCP Build Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #6c757d; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h3 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .file-list { background: #f8f9fa; border-radius: 8px; padding: 20px; }
        .file-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
        .file-item:last-child { border-bottom: none; }
        .file-size { color: #6c757d; font-family: monospace; }
        .dependency-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
        .dependency-item { background: #f8f9fa; padding: 15px; border-radius: 6px; }
        .dependency-name { font-weight: bold; color: #333; }
        .dependency-size { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 DyneMCP Build Report</h1>
            <p>Generated on ${new Date(manifest.timestamp).toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${(manifest.stats.totalSize / 1024).toFixed(1)}KB</div>
                    <div class="stat-label">Total Size</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${manifest.stats.totalModules}</div>
                    <div class="stat-label">Modules</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${manifest.stats.totalChunks}</div>
                    <div class="stat-label">Chunks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Object.keys(manifest.dependencies).length}</div>
                    <div class="stat-label">Dependencies</div>
                </div>
            </div>

            <div class="section">
                <h3>📁 Output Files</h3>
                <div class="file-list">
                    ${Object.entries(manifest.outputs)
                      .map(
                        ([file, info]) => `
                        <div class="file-item">
                            <span>${file}</span>
                            <span class="file-size">${(info.size / 1024).toFixed(1)}KB</span>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>

            <div class="section">
                <h3>📦 Dependencies</h3>
                <div class="dependency-list">
                    ${Object.entries(manifest.dependencies)
                      .map(
                        ([name, info]) => `
                        <div class="dependency-item">
                            <div class="dependency-name">${name}</div>
                            <div class="dependency-size">${(info.size / 1024).toFixed(1)}KB</div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

    const reportPath = join(outDir, 'build-report.html')
    await fs.writeFile(reportPath, html)

    if (shouldLog()) console.log(`📊 HTML report generated: ${reportPath}`)
  } catch (error) {
    if (shouldLog()) console.warn('⚠️  Could not generate HTML report:', error)
  }
}
