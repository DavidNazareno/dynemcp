import path from 'path'

/**
 * Returns the absolute path to the templates directory
 */
export function getTemplatesDir(): string {
  let templatesDir: string

  try {
    // Try ESM approach first
    const url = import.meta?.url || ''
    const currentDir = path.dirname(new URL(url, 'file://').pathname)
    templatesDir = path.resolve(currentDir, '../..', 'templates')
  } catch {
    // Fallback to CommonJS approach
    templatesDir = path.resolve(__dirname, '../..', 'templates')
  }

  return templatesDir
}
