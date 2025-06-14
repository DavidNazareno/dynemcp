#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import { Command } from 'commander'
import inquirer from 'inquirer'
import ora from 'ora'
import {
  createProject,
  getAvailableTemplates,
} from './helpers/create-project'
import {
  validateProjectName,
  validateProjectPath,
  validateTemplate,
} from './helpers/validate'
import type { PackageManager } from './helpers/package-manager'
import {
  installDependencies,
  getRunCommand,
} from './helpers/package-manager'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Versión del paquete
const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
)

// Configuración del programa
const program = new Command('create-dynemcp')
  .version(version)
  .description('Create DyneMCP apps with one command')
  .argument('[project-directory]', 'The directory to create the app in')
  .option('--template <name>', 'The template to use (default, minimal, full)')
  .option('--use-npm', 'Use npm as package manager')
  .option('--use-yarn', 'Use yarn as package manager')
  .option('--use-pnpm', 'Use pnpm as package manager (default)')
  .option('--typescript', 'Initialize as a TypeScript project')
  .option('--no-typescript', 'Initialize as a JavaScript project')
  .option('--eslint', 'Include ESLint configuration')
  .option('--no-eslint', 'Skip ESLint configuration')
  .option('--git', 'Initialize a git repository')
  .option('--no-git', 'Skip git repository initialization')
  .option('-y, --yes', 'Skip all prompts and use default values')
  .parse(process.argv)

async function run(): Promise<void> {
  const options = program.opts()
  let projectDirectory = program.args[0]

  const spinner = ora()

  try {
    let packageManager: PackageManager = 'pnpm'
    if (options.useNpm) packageManager = 'npm'
    if (options.useYarn) packageManager = 'yarn'
    if (options.usePnpm) packageManager = 'pnpm'

    const availableTemplates = await getAvailableTemplates()

    if (!projectDirectory || !options.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project named?',
          default: 'my-mcp-project',
          when: !projectDirectory,
          validate: (input: string): boolean | string => {
            const { valid, problems } = validateProjectName(input)
            if (valid) return true
            return `Invalid project name: ${problems?.join(', ')}`
          },
        },
        {
          type: 'list',
          name: 'template',
          message: 'Select a template:',
          choices: availableTemplates,
          default: 'default',
          when: !options.template && !options.yes,
        },
        {
          type: 'confirm',
          name: 'typescript',
          message: 'Would you like to use TypeScript?',
          default: true,
          when: options.typescript === undefined && !options.yes,
        },
        {
          type: 'confirm',
          name: 'eslint',
          message: 'Would you like to use ESLint?',
          default: true,
          when: options.eslint === undefined && !options.yes,
        },
        {
          type: 'confirm',
          name: 'git',
          message: 'Initialize a git repository?',
          default: true,
          when: options.git === undefined && !options.yes,
        },
      ])

      // Combinar respuestas con opciones de línea de comandos
      if (answers.projectName) projectDirectory = answers.projectName
      if (answers.template) options.template = answers.template
      if (answers.typescript !== undefined)
        options.typescript = answers.typescript
      if (answers.eslint !== undefined) options.eslint = answers.eslint
      if (answers.git !== undefined) options.git = answers.git
    }

    // Asegurarse de que tenemos un directorio de proyecto
    projectDirectory ??= 'my-mcp-project'

    // Validar nombre del proyecto
    const { valid: validName, problems } = validateProjectName(projectDirectory)
    if (!validName) {
      console.error(chalk.red(`Invalid project name: ${problems?.join(', ')}`))
      process.exit(1)
    }

    // Crear ruta completa del proyecto
    const projectPath = path.resolve(process.cwd(), projectDirectory)

    // Validar ruta del proyecto
    const { valid: validPath, message } = validateProjectPath(projectPath)
    if (!validPath) {
      console.error(chalk.red(message))
      process.exit(1)
    }

    // Validar plantilla
    const template = options.template ?? 'default'
    const { valid: validTemplate, message: templateMessage } = validateTemplate(
      template,
      availableTemplates
    )
    if (!validTemplate) {
      console.error(chalk.red(templateMessage))
      process.exit(1)
    }

    // Crear proyecto
    spinner.start('Creating project...')
    await createProject({
      projectPath,
      template,
      typescript: options.typescript !== false, // Default to true
      eslint: options.eslint !== false, // Default to true
    })
    spinner.succeed('Project created')

    // Instalar dependencias
    spinner.start('Installing dependencies...')
    await installDependencies(projectPath, packageManager)
    spinner.succeed('Dependencies installed')

    // Inicializar git si se solicitó
    if (options.git !== false) {
      // Default to true
      spinner.start('Initializing git repository...')
      const { success } = await initGitRepo(projectPath)
      if (success) {
        spinner.succeed('Git repository initialized')
      } else {
        spinner.fail('Failed to initialize git repository')
      }
    }

    // Mostrar mensaje de éxito
    console.log(
      `\n${chalk.green('Success!')} Created ${chalk.cyan(projectDirectory)} at ${chalk.cyan(projectPath)}\n`
    )

    // Mostrar comandos para iniciar
    const runCommand = getRunCommand(packageManager)
    console.log('Inside that directory, you can run several commands:')
    console.log(`\n  ${chalk.cyan(runCommand('dev'))}`)
    console.log('    Starts the development server.')
    console.log(`\n  ${chalk.cyan(runCommand('build'))}`)
    console.log('    Builds the app for production.')
    console.log(`\n  ${chalk.cyan(runCommand('start'))}`)
    console.log('    Runs the built app in production mode.')

    console.log('\nWe suggest that you begin by typing:')
    console.log(`\n  ${chalk.cyan('cd')} ${projectDirectory}`)
    console.log(`  ${chalk.cyan(runCommand('dev'))}\n`)
    console.log('Happy hacking!')
  } catch (error) {
    spinner.fail('Failed to create project')
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    )
    process.exit(1)
  }
}

// Inicializar repositorio git
async function initGitRepo(projectPath: string): Promise<{ success: boolean }> {
  try {
    const { execa } = await import('execa')
    await execa('git', ['init'], { cwd: projectPath })
    await execa('git', ['add', '.'], { cwd: projectPath })
    await execa('git', ['commit', '-m', 'Initial commit from create-dynemcp'], {
      cwd: projectPath,
    })
    return { success: true }
  } catch (error) {
    console.error(
      `Failed to initialize git repository: ${error instanceof Error ? error.message : String(error)}`
    )
    return { success: false }
  }
}

// Ejecutar la función principal
run().catch(error => {
  console.error(
    chalk.red(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    )
  )
  process.exit(1)
})
