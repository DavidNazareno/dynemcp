/**
 * DyneMCP Project Module
 *
 * Exposes the public API for project creation, validation, and management utilities.
 * All exports are re-exported from their respective core implementations.
 */
export { createProject } from './core/create-project.js'
export {
  validateProjectName,
  validateProjectPath,
  validateTemplate,
  type ValidationResult,
} from './core/validate.js'
export * from './core/copy.js'
export * from './core/package-info.js'
export * from './core/package-manager.js'
