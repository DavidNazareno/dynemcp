import fs from 'fs-extra'
import path from 'path'
import fastGlob from 'fast-glob'

type GlobFunction = (
  patterns: string | string[],
  options?: object
) => Promise<string[]>

const { glob } = fastGlob as { glob: GlobFunction }

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
      ignore: ['**/node_modules/**', '**/.git/**'],
    })

    console.log('[DEBUG] Archivos encontrados para copiar:', files)

    for (const file of files) {
      const src = path.resolve(cwd, file)
      const isDirectory = fs.statSync(src).isDirectory()

      // Skip directories - we'll copy their contents when they match the pattern
      if (isDirectory) {
        console.log(`[DEBUG] ⏭️  Skipping directory: ${file}`)
        continue
      }

      const filename = rename
        ? rename(path.basename(file))
        : path.basename(file)
      const relativeDir = path.dirname(file)
      const dest = parents
        ? path.join(destination, relativeDir, filename)
        : path.join(destination, filename)

      // Ensure the directory exists
      await fs.ensureDir(path.dirname(dest))
      await fs.copy(src, dest)
      console.log(`[DEBUG] Copiado: ${src} -> ${dest}`)
    }
  } catch (error) {
    console.error('❌ Error copying files:', error)
    throw error
  }
}
