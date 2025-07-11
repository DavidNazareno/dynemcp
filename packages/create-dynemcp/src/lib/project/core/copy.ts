import fs from 'fs-extra'
import path from 'path'
import pkg from 'fast-glob'
const { glob } = pkg

interface CopyOptions {
  parents?: boolean
  cwd?: string
  rename?: (name: string) => string
}

export async function copy(
  source: string | string[],
  destination: string,
  options: CopyOptions = {}
): Promise<void> {
  const sources = Array.isArray(source) ? source : [source]
  const { parents = true, cwd = process.cwd(), rename } = options

  try {
    const files = await glob(sources, {
      cwd,
      dot: true,
      absolute: false,
      onlyFiles: true,
      ignore: ['**/node_modules/**', '**/.git/**'],
    })

    for (const file of files) {
      const src = path.resolve(cwd, file)
      const filename = rename
        ? rename(path.basename(file))
        : path.basename(file)
      const relativeDir = path.dirname(file)
      const dest = parents
        ? path.join(destination, relativeDir, filename)
        : path.join(destination, filename)

      await fs.ensureDir(path.dirname(dest))
      await fs.copy(src, dest)
    }
  } catch (error) {
    console.error('❌ Error copying files:', error)
    throw error
  }
}
