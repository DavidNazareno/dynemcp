import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { execSync as _execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { PackageManager as _PackageManager } from './package-manager.js'

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)

interface CreateProjectOptions {
  projectPath: string
  template: string
  typescript: boolean
  eslint: boolean
}

export async function getAvailableTemplates(): Promise<string[]> {
  const templatesDir = path.join(__dirname, '../../templates')

  try {
    const templates = await fs.readdir(templatesDir)
    return templates.filter(template =>
      fs.statSync(path.join(templatesDir, template)).isDirectory()
    )
  } catch (error) {
    console.error('Error reading templates directory:', error)
    return ['default'] // Fallback to default template
  }
}

export async function createProject(
  options: CreateProjectOptions
): Promise<void> {
  const { projectPath, template, typescript, eslint } = options
  const projectName = path.basename(projectPath)

  // Ensure the project directory exists
  await fs.ensureDir(projectPath)

  // Copy template files
  const templatePath = path.join(__dirname, '../../templates', template)

  try {
    await fs.copy(templatePath, projectPath, {
      filter: src => {
        // Skip typescript files if not using typescript
        if (!typescript && src.endsWith('.ts') && !src.endsWith('.d.ts')) {
          return false
        }

        // Skip eslint files if not using eslint
        if (
          !eslint &&
          (src.includes('.eslint') || src.endsWith('eslintrc.js'))
        ) {
          return false
        }

        return true
      },
    })

    // Update package.json with project name
    const packageJsonPath = path.join(projectPath, 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)
      packageJson.name = projectName
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
    }

    // Update dynemcp.config.json with project name
    const configPath = path.join(projectPath, 'dynemcp.config.json')
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath)
      config.name = projectName
      await fs.writeJson(configPath, config, { spaces: 2 })
    }

    // Crear archivo .gitignore para que pueda ser inicializado posteriormente
    await fs.writeFile(
      path.join(projectPath, '.gitignore'),
      'node_modules\ndist\n.env\n.DS_Store\n'
    )

    console.log(
      `\n${chalk.green('Success!')} Created ${projectName} at ${projectPath}`
    )
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}
