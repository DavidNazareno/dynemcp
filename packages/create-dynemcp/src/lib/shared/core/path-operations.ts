import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { TEMPLATES } from '../../../global/config-all-constants'

/**
 * Returns the absolute path to the templates directory
 */
export function getTemplatesDir(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  // Always points to dist/templates relative to the bundle
  const templatesPath = path.resolve(__dirname, 'templates')
  if (!fs.existsSync(templatesPath)) {
    throw new Error(
      `[getTemplatesDir] Templates folder not found at: ${templatesPath}`
    )
  }
  return templatesPath
}

/**
 * Returns the version from package.json
 */
export function getPackageVersion(): string {
  try {
    // Get the templates directory path and navigate up to find package.json
    const templatesDir = getTemplatesDir()
    const packageJsonPath = path.resolve(templatesDir, '../../package.json')

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      return packageJson.version || '0.0.1'
    }
  } catch (error) {
    console.warn('Failed to read package.json version:', error)
  }

  return '0.0.1' // Default version if not found
}

/**
 * Returns a list of available templates in the templates directory
 */
export async function getAvailableTemplates(): Promise<string[]> {
  return [...TEMPLATES.AVAILABLE_TEMPLATES]
}
