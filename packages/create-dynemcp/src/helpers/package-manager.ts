import { execSync } from 'child_process';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

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
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch (_e) {
      return 'npm';
    }
  }
}

// Legacy function, kept for backward compatibility
export function detectPackageManager(): PackageManager {
  return getPkgManager();
}

export function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'npm':
      return 'npm install';
    case 'yarn':
      return 'yarn';
    case 'pnpm':
      return 'pnpm install';
    default:
      return 'npm install';
  }
}

export function getRunCommand(packageManager: PackageManager): (script: string) => string {
  return (script: string): string => {
    switch (packageManager) {
      case 'npm':
        return `npm run ${script}`;
      case 'yarn':
        return `yarn ${script}`;
      case 'pnpm':
        return `pnpm run ${script}`;
      default:
        return `npm run ${script}`;
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
