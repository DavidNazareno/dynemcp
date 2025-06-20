import { execa } from 'execa'

export type PackageManager = 'npm' | 'yarn' | 'pnpm'

/**
 * Returns the package manager used in the project based on user preference
 * or available package managers on the system.
 */
export function getPkgManager(): PackageManager {
  // User rule: prefer pnpm
  try {
    execa('pnpm', ['--version'], { stdio: 'ignore' })
    return 'pnpm'
  } catch {
    return 'pnpm'
  }
}

export function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm install'
    default:
      return 'pnpm install'
  }
}

export function getRunCommand(
  packageManager: PackageManager
): (script: string) => string {
  return (script: string): string => {
    switch (packageManager) {
      case 'pnpm':
        return `pnpm run ${script}`
      default:
        return `pnpm run ${script}`
    }
  }
}

export async function installDependencies(projectPath: string): Promise<void> {
  try {
    await execa('npm', ['install'], { cwd: projectPath, stdio: 'inherit' })
  } catch (error) {
    throw new Error(
      `Failed to install dependencies: ${error instanceof Error ? error.message : error}`
    )
  }
}
