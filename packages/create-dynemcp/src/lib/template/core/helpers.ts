import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { TEMPLATES } from '../../../global/config-all-constants'

/**
 * Returns a list of available templates in the templates directory
 */
export async function getAvailableTemplates(): Promise<string[]> {
  return [...TEMPLATES.AVAILABLE_TEMPLATES]
}

export function getTemplatesDir(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const templatesPath = path.resolve(__dirname, 'templates')
  if (!fs.existsSync(templatesPath)) {
    throw new Error(
      `[getTemplatesDir] Templates folder not found at: ${templatesPath}`
    )
  }
  return templatesPath
}
