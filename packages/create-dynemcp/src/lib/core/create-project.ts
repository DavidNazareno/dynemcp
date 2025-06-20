import fs from 'fs/promises';
import path from 'path';
import { installTemplate } from './template-generator.js';
import type { PackageManager } from '../helpers/package-manager.js';

// Get the templates directory path
const templatesDir = getTemplatesDir();

interface CreateProjectOptions {
  projectPath: string;
  template: string;
  typescript: boolean;
  eslint: boolean;
}

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

/**
 * Updates project configuration files with the project name
 */
async function updateProjectConfig(projectPath: string, projectName: string): Promise<void> {
  // Update package.json with project name
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // Update dynemcp.config.json with project name
  const configPath = path.join(projectPath, 'dynemcp.config.json');
  if (await fs.pathExists(configPath)) {
    const config = await fs.readJson(configPath);
    config.name = projectName;
    await fs.writeJson(configPath, config, { spaces: 2 });
  }
}

/**
 * Creates a .gitignore file in the project directory
 */
async function createGitIgnore(projectPath: string): Promise<void> {
  await fs.writeFile(path.join(projectPath, '.gitignore'), 'node_modules\ndist\n.env\n.DS_Store\n');
}
