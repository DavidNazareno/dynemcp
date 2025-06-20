import fs from 'fs-extra';
import { installTemplate } from './template-generator.js';
import type { PackageManager } from '../helpers/package-manager.js';

/**
 * Returns a list of available templates in the templates directory
 */
export async function getAvailableTemplates(): Promise<string[]> {
  return ['default', 'calculator'];
}

/**
 * Creates a new project using the specified template and options
 */
export async function createProject(
  projectPath: string,
  projectName: string,
  template: string,
): Promise<void> {
  // Create project directory
  await fs.mkdir(projectPath, { recursive: true });

  // Use the existing installTemplate function
  await installTemplate({
    appName: projectName,
    root: projectPath,
    packageManager: 'npm' as PackageManager,
    template,
    mode: 'ts',
    tailwind: false,
    eslint: true,
    srcDir: true,
    importAlias: '@/*',
    skipInstall: false,
  });
}
