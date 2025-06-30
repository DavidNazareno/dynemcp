// ... aquí irá la lógica de package-info ...

import fs from 'fs'
import path from 'path'
import { getTemplatesDir } from '../../template'

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
