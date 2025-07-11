// file-discovery.ts
// Utility for recursively discovering component files in a directory structure
// Enables plug-and-play loading of tools, resources, and prompts for DyneMCP.

import fs from 'fs'
import path from 'path'
import picomatch from 'picomatch'

export async function findFilesRecursively(
  dir: string,
  pattern?: string
): Promise<string[]> {
  const files: string[] = []
  const isMatch = pattern ? picomatch(pattern) : null

  async function scanDirectory(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, {
      withFileTypes: true,
    })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await scanDirectory(fullPath)
      } else if (entry.isFile()) {
        const relPath = path.relative(dir, fullPath)
        if (!isMatch || isMatch(relPath)) {
          files.push(fullPath)
        }
      }
    }
  }
  await scanDirectory(dir)
  return files
}
