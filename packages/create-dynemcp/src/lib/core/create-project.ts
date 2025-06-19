import fs from 'fs-extra';
import path from 'path';
import { getTemplatesDir } from '../helpers/paths.js';

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
  try {
    const templates = await fs.readdir(templatesDir);
    return templates.filter((template) =>
      fs.statSync(path.join(templatesDir, template)).isDirectory(),
    );
  } catch (error) {
    console.error('Error reading templates directory:', error);
    return ['default']; // Fallback to default template
  }
}

/**
 * Creates a new project using the specified template and options
 */
export async function createProject(options: CreateProjectOptions): Promise<void> {
  const { projectPath, template, typescript, eslint } = options;
  const projectName = path.basename(projectPath);

  // Ensure the project directory exists
  await fs.ensureDir(projectPath);

  // Copy template files
  const templatePath = path.join(templatesDir, template);

  try {
    // Copy template files with filtering
    await fs.copy(templatePath, projectPath, {
      filter: (src) => {
        // Skip typescript files if not using typescript
        if (!typescript && src.endsWith('.ts') && !src.endsWith('.d.ts')) {
          return false;
        }

        // Skip eslint files if not using eslint
        if (!eslint && (src.includes('.eslint') || src.endsWith('eslintrc.js'))) {
          return false;
        }

        return true;
      },
    });

    // Update package.json with project name
    await updateProjectConfig(projectPath, projectName);

    // Create .gitignore file
    await createGitIgnore(projectPath);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
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
