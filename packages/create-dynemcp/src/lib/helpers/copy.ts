import fs from 'fs-extra'
import path from 'path'
import fastGlob from 'fast-glob' // Importar como módulo completo

// Definir un tipo para la función glob
type GlobFunction = (
  patterns: string | string[],
  options?: object
) => Promise<string[]>

// Extraer la función glob con el tipo correcto
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

    for (const file of files) {
      const src = path.resolve(cwd, file)
      const isDirectory = fs.statSync(src).isDirectory()

      // Skip directories if we're only copying files
      if (isDirectory) continue

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
    }
  } catch (error) {
    console.error('Error copying files:', error)
    throw error
  }
}
