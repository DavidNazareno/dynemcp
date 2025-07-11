// ... here will go the package-info logic ...

import fs from 'fs'
import path from 'path'
import { getTemplatesDir } from '../../template'

/**
 * Returns the version from package.json
 */
export function getPackageVersion(): string {
  try {
    const templatesDir = getTemplatesDir()
    const packageJsonPath = path.resolve(templatesDir, '../../package.json')

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      return packageJson.version || '0.0.1'
    }
  } catch (error) {
    console.warn('Failed to read package.json version:', error)
  }

  return '0.0.1'
}
