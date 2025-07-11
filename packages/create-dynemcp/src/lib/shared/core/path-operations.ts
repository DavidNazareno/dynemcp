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
 * Returns a list of available templates in the templates directory
 */
export async function getAvailableTemplates(): Promise<string[]> {
  return [...TEMPLATES.AVAILABLE_TEMPLATES]
}
