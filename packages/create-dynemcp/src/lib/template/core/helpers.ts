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
 * Returns the absolute path to the templates directory
 */
export function getTemplatesDir(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  // En desarrollo, las plantillas están en src/lib/template/templates
  // En producción, las plantillas están en dist/templates
  const isDev = process.env.NODE_ENV === 'development'
  const templatesPath = isDev
    ? path.resolve(__dirname, '../templates')
    : path.resolve(__dirname, '../../../templates')

  console.log('Current directory:', __dirname)
  console.log('Templates directory:', templatesPath)
  console.log('Environment:', process.env.NODE_ENV)

  return templatesPath
}
