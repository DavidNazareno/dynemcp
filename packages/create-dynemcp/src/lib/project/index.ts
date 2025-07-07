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
// Re-export shared utilities for backwards compatibility
export { copy } from '../shared/core/file-operations'
export { getPackageVersion } from '../shared/core/path-operations'
export {
  installDependencies,
  getPkgManager,
  getInstallCommand,
  getRunCommand,
  type PackageManager,
} from '../shared/core/package-operations'
