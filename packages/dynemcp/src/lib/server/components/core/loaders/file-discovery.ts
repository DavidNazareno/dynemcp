// file-discovery.ts
// Utility for recursively discovering component files in a directory structure
// Enables plug-and-play loading of tools, resources, and prompts for DyneMCP.

import fs from 'fs'
import path from 'path'

/**
 * findFilesRecursively: Recursively finds all component files (tool, resource, prompt, sample) in a directory.
 * Returns absolute file paths for dynamic loading.
 *
 * @param dir - The root directory to start searching from
 * @returns An array of absolute file paths for discovered component files
 */
export async function findFilesRecursively(dir: string): Promise<string[]> {
  const files: string[] = []

  async function scanDirectory(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, {
      withFileTypes: true,
    })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await scanDirectory(fullPath)
      } else if (entry.isFile()) {
        // Only include files that match the expected component file names
        if (
          entry.name === 'tool.ts' ||
          entry.name === 'tool.js' ||
          entry.name === 'resource.ts' ||
          entry.name === 'resource.js' ||
          entry.name === 'prompt.ts' ||
          entry.name === 'prompt.js' ||
          entry.name === 'sample.ts' ||
          entry.name === 'sample.js' ||
          entry.name === 'resources-template.ts' ||
          entry.name === 'resources-template.js'
        ) {
          files.push(fullPath)
        }
      }
    }
  }
  await scanDirectory(dir)
  return files
}
