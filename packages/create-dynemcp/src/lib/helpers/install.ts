import { PackageManager } from './package-manager.js';

/**
 * Installs dependencies using the specified package manager
 */
export async function install(packageManager: PackageManager): Promise<void> {
  const { execa } = await import('execa');

  const args = ['install'];

  try {
    await execa(packageManager, args, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(`Failed to install dependencies with ${packageManager}.`);
    throw error;
  }
}
