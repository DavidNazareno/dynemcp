import path from 'path'
import { fileURLToPath } from 'url'
import { TEMPLATES } from '../../../global/config-all-constants.js'

/**
 * Returns a list of available templates in the templates directory
 */
export async function getAvailableTemplates(): Promise<string[]> {
  return [...TEMPLATES.AVAILABLE_TEMPLATES]
}

/**
 * Returns the absolute path to the templates directory (igual que Next.js)
 */
export function getTemplatesDir(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(__dirname, '../templates')
}
