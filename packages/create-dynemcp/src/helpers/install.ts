import { PackageManager } from './package-manager'

/**
 * Installs dependencies using the specified package manager
 */
export async function install(
  packageManager: PackageManager,
  isOnline: boolean
): Promise<void> {
  const { execa } = await import('execa')

  const args = ['install']

  // Add appropriate flags based on package manager and network status
  if (packageManager === 'yarn') {
    if (!isOnline) {
      args.push('--offline')
    }
    args.push('--non-interactive')
  } else if (packageManager === 'pnpm') {
    if (!isOnline) {
      args.push('--offline')
    }
    // Add any pnpm specific flags here if needed
  } else if (packageManager === 'npm') {
    if (!isOnline) {
      args.push('--offline')
    }
    args.push('--no-audit')
  }

  try {
    await execa(packageManager, args, {
      stdio: 'inherit',
    })
  } catch (error) {
    console.error(`Failed to install dependencies with ${packageManager}.`)
    throw error
  }
}
