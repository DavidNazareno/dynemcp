// ts-compiler.ts
// Utilities for dynamic TypeScript compilation and import resolution
// Used by the DyneMCP framework to support plug-and-play component loading

import fs from 'fs'
import path from 'path'
import { transform } from 'esbuild'

/**
 * Compiles a TypeScript file to JavaScript using esbuild.
 * This is used to allow dynamic loading of .ts components at runtime.
 *
 * @param tsPath - The absolute path to the TypeScript file
 * @param jsPath - The absolute path where the compiled JavaScript should be written
 * @returns The compiled JavaScript code as a string
 */
export async function transformTsFile(
  tsPath: string,
  jsPath: string
): Promise<string> {
  const tsCode = await fs.promises.readFile(tsPath, 'utf-8')
  const result = await transform(tsCode, {
    loader: 'ts',
    format: 'cjs',
    target: 'node16',
    platform: 'node',
  })
  await fs.promises.writeFile(jsPath, result.code)
  return result.code
}

/**
 * Recursively resolves and compiles all relative imports in a TypeScript file.
 * Ensures that all dependencies are available for dynamic import at runtime.
 *
 * @param tsCode - The TypeScript source code as a string
 * @param sourceDir - The directory of the source file
 * @param tempDir - The temporary directory where compiled files are written
 */
export async function resolveAndCompileRelativeImports(
  tsCode: string,
  sourceDir: string,
  tempDir: string
): Promise<void> {
  const importRegex = /import\s+.*?\s+from\s+['"](\.[^'"]+)['"]/g
  const matches = Array.from(tsCode.matchAll(importRegex))
  for (const match of matches) {
    const relativeImport = match[1]
    const extensions = ['.ts', '.js']
    let sourceFile: string | null = null
    for (const ext of extensions) {
      const fullPath = path.resolve(sourceDir, relativeImport + ext)
      if (fs.existsSync(fullPath)) {
        sourceFile = fullPath
        break
      }
    }
    if (sourceFile) {
      const relativePath = path.relative(sourceDir, sourceFile)
      const targetPath = path.join(
        tempDir,
        relativePath.replace(/\.ts$/, '.js')
      )
      await fs.promises.mkdir(path.dirname(targetPath), { recursive: true })
      const depCode = await fs.promises.readFile(sourceFile, 'utf-8')
      await transformTsFile(sourceFile, targetPath)
      await resolveAndCompileRelativeImports(
        depCode,
        path.dirname(sourceFile),
        tempDir
      )
    }
  }
}
