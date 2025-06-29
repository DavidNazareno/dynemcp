/**
 * DyneMCP Template Module
 *
 * Exposes the public API for template management and installation utilities.
 * All exports are re-exported from their respective core implementations.
 */
export { installTemplate, getTemplateFile } from './core/template-generator.js'
export { getAvailableTemplates, getTemplatesDir } from './core/helpers.js'
