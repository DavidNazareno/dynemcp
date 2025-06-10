import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs-extra'

export type PackageManager = 'npm' | 'yarn' | 'pnpm'

export function detectPackageManager(): PackageManager {
  // Preferimos pnpm según las reglas del usuario
  try {
    execSync('pnpm --version', { stdio: 'ignore' })
    return 'pnpm'
  } catch (e) {
    // pnpm no está disponible, intentamos con yarn
    try {
      execSync('yarn --version', { stdio: 'ignore' })
      return 'yarn'
    } catch (e) {
      // Por defecto, usamos npm
      return 'npm'
    }
  }
}

export function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'npm':
      return 'npm install'
    case 'yarn':
      return 'yarn'
    case 'pnpm':
      return 'pnpm install'
    default:
      return 'npm install'
  }
}

export function getRunCommand(
  packageManager: PackageManager
): (script: string) => string {
  return (script: string): string => {
    switch (packageManager) {
      case 'npm':
        return `npm run ${script}`
      case 'yarn':
        return `yarn ${script}`
      case 'pnpm':
        return `pnpm run ${script}`
      default:
        return `npm run ${script}`
    }
  }
}

export async function installDependencies(
  projectPath: string,
  packageManager: PackageManager
): Promise<void> {
  try {
    const { execa } = await import('execa')
    await execa(packageManager, ['install'], {
      cwd: projectPath,
      stdio: 'inherit',
    })
  } catch (error) {
    console.error(`Failed to install dependencies with ${packageManager}.`)
    throw error
  }
}
