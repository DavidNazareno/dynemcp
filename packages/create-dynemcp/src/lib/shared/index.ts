/**
 * DyneMCP Shared Utilities Module
 *
 * Contains utilities that are shared between project and template modules
 * to avoid circular dependencies.
 */
export { copy } from './core/file-operations'
export { installDependencies } from './core/package-operations'
export { getPackageVersion, getTemplatesDir } from './core/path-operations'
