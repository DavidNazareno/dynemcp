/**
 * DyneMCP Project Module
 *
 * Exposes the public API for project creation, validation, and management utilities.
 * All exports are re-exported from their respective core implementations.
 */
export { createProject } from './core/create-project'
export {
  validateProjectName,
  validateProjectPath,
  validateTemplate,
  type ValidationResult,
} from './core/validate'
export * from './core/copy'
export * from './core/package-info'
export * from './core/package-manager'
