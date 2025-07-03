import { default as execa } from 'execa'
import {
  PACKAGE_MANAGER,
  type PackageManager,
} from '../../../global/config-all-constants'

export type { PackageManager }

/**
 * Returns the package manager used in the project based on user preference
 * or available package managers on the system.
 */
export function getPkgManager(): PackageManager {
  // User rule: prefer pnpm
  try {
    execa(PACKAGE_MANAGER.PREFERRED, ['--version'], { stdio: 'ignore' })
    return PACKAGE_MANAGER.PREFERRED
  } catch {
    return PACKAGE_MANAGER.PREFERRED
  }
}

export function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case PACKAGE_MANAGER.PREFERRED:
      return `${PACKAGE_MANAGER.PREFERRED} install`
    default:
      return `${PACKAGE_MANAGER.PREFERRED} install`
  }
}

export function getRunCommand(
  packageManager: PackageManager
): (script: string) => string {
  return (script: string): string => {
    switch (packageManager) {
      case PACKAGE_MANAGER.PREFERRED:
        return `${PACKAGE_MANAGER.PREFERRED} run ${script}`
      default:
        return `${PACKAGE_MANAGER.PREFERRED} run ${script}`
    }
  }
}

export async function installDependencies(projectPath: string): Promise<void> {
  try {
    await execa(PACKAGE_MANAGER.PREFERRED, ['install'], {
      cwd: projectPath,
      stdio: 'inherit',
    })
  } catch (error) {
    throw new Error(
      `Failed to install dependencies: ${error instanceof Error ? error.message : error}`
    )
  }
}
