import { execSync } from 'child_process';

export type PackageManager = 'pnpm'; // Solo se permite pnpm

/**
 * Returns the package manager used in the project based on user preference
 * or available package managers on the system.
 */
export function getPkgManager(): PackageManager {
  // User rule: prefer pnpm
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch (_e) {
    return 'pnpm';
  }
}

export function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm install';
    default:
      return 'pnpm install';
  }
}

export function getRunCommand(packageManager: PackageManager): (script: string) => string {
  return (script: string): string => {
    switch (packageManager) {
      case 'pnpm':
        return `pnpm run ${script}`;
      default:
        return `pnpm run ${script}`;
    }
  };
}

export async function installDependencies(
  projectPath: string,
  packageManager: PackageManager,
): Promise<void> {
  try {
    const { execa } = await import('execa');
    await execa(packageManager, ['install'], {
      cwd: projectPath,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(`Failed to install dependencies with ${packageManager}.`);
    throw error;
  }
}
