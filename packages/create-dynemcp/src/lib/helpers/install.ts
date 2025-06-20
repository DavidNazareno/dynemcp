import { PackageManager } from './package-manager.js'

/**
 * Instala dependencias usando pnpm
 */
export async function install(packageManager: PackageManager): Promise<void> {
  const { execa } = await import('execa')

  const args = ['install']

  try {
    await execa(packageManager, args, {
      stdio: 'inherit',
    })
  } catch (error) {
    console.error(`Failed to install dependencies with ${packageManager}.`)
    throw error
  }
}
