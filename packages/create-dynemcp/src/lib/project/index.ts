/**
 * DyneMCP Project Module
 *
 * Exposes the public API for project creation, validation, and management utilities.
 * All exports are re-exported from their respective core implementations.
 */
export { createProject } from './core/create-project'
export { installDependencies } from './core/install'
export {
  validateProjectName,
  validateProjectPath,
  validateTemplate,
  type ValidationResult,
} from './core/validate'
