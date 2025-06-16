#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import { Command } from 'commander'
import Conf from 'conf'
import inquirer from 'inquirer'
import ora from 'ora'
import updateCheck from 'update-check'
import { createProject, getAvailableTemplates } from './helpers/create-project'
import {
  validateProjectName,
  validateProjectPath,
  validateTemplate,
} from './helpers/validate'
import type { PackageManager } from './helpers/package-manager'
import {
  installDependencies,
  getRunCommand,
  getPkgManager,
} from './helpers/package-manager'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Package version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
)
const version = packageJson.version

// Program configuration
const program = new Command('create-dynemcp')
  .version(
    version,
    '-v, --version',
    'Output the current version of create-dynemcp'
  )
  .argument('[directory]', 'The directory to create the app in')
  .usage('[directory] [options]')
  .helpOption('-h, --help', 'Display this help message.')
  .option('--template <name>', 'The template to use (default, minimal, full)')
  .option('--ts, --typescript', 'Initialize as a TypeScript project (default)')
  .option('--js, --javascript', 'Initialize as a JavaScript project')
  .option('--eslint', 'Include ESLint configuration (default)')
  .option('--no-eslint', 'Skip ESLint configuration')
  .option(
    '--use-npm',
    'Explicitly tell the CLI to bootstrap the application using npm'
  )
  .option(
    '--use-yarn',
    'Explicitly tell the CLI to bootstrap the application using Yarn'
  )
  .option(
    '--use-pnpm',
    'Explicitly tell the CLI to bootstrap the application using pnpm (default)'
  )
  .option('--git', 'Initialize a git repository (default)')
  .option('--no-git', 'Skip git repository initialization')
  .option('--skip-install', 'Skip installing dependencies')
  .option('-y, --yes', 'Skip all prompts and use default values')
  .option(
    '--reset, --reset-preferences',
    'Reset the preferences saved for create-dynemcp'
  )
  .allowUnknownOption()
  .parse(process.argv)

async function run(): Promise<void> {
  const options = program.opts()
  const { args } = program
  let projectDirectory = args[0]

  const spinner = ora()
  const conf = new Conf({ projectName: 'create-dynemcp' })

  // Check for updates
  try {
    const update = await updateCheck(packageJson)
    if (update?.latest) {
      const updateMessage = `Update available! ${packageJson.version} → ${update.latest}`
      console.log()
      console.log(chalk.yellow(`${updateMessage}`))
      console.log(chalk.yellow('Run `pnpm i -g create-dynemcp` to update'))
      console.log()
    }
  } catch (_err) {
    // Ignore error
  }

  // Handle reset preferences option
  if (options.resetPreferences) {
    const { resetPreferences } = await inquirer.prompt({
      type: 'confirm',
      name: 'resetPreferences',
      message: 'Would you like to reset the saved preferences?',
      default: false,
    })
    if (resetPreferences) {
      conf.clear()
      console.log(chalk.green('The preferences have been reset successfully!'))
    }
    process.exit(0)
  }

  try {
    // Determine package manager
    const packageManager: PackageManager = options.useNpm
      ? 'npm'
      : options.useYarn
        ? 'yarn'
        : options.usePnpm
          ? 'pnpm'
          : getPkgManager()

    const availableTemplates = await getAvailableTemplates()
    const preferences = (conf.get('preferences') ?? {}) as Record<
      string,
      boolean | string
    >

    // If project directory is not provided or not using --yes flag, prompt for input
    if (!projectDirectory) {
      const res = await inquirer.prompt({
        type: 'input',
        name: 'path',
        message: 'What is your project named?',
        default: 'my-mcp-project',
        validate: (name: string): boolean | string => {
          const validation = validateProjectName(name)
          if (validation.valid) return true
          return (
            'Invalid project name: ' +
            (validation.problems?.[0] ?? 'Invalid name')
          )
        },
      })

      if (typeof res.path === 'string') {
        projectDirectory = res.path.trim()
      }
    }

    if (!projectDirectory) {
      console.log(
        '\nPlease specify the project directory:\n' +
          `  ${chalk.cyan('create-dynemcp')} ${chalk.green('<project-directory>')}\n` +
          'For example:\n' +
          `  ${chalk.cyan('create-dynemcp')} ${chalk.green('my-mcp-app')}\n\n` +
          `Run ${chalk.cyan('create-dynemcp --help')} to see all options.`
      )
      process.exit(1)
    }

    // Skip prompts if --yes flag is provided
    if (!options.yes) {
      const defaults = {
        typescript: true,
        eslint: true,
        template: 'default',
        git: true,
      }

      const getPrefOrDefault = (field: string): boolean | string =>
        preferences[field] ?? defaults[field as keyof typeof defaults]

      // Prompt for template
      if (!options.template) {
        const { template } = await inquirer.prompt({
          type: 'list',
          name: 'template',
          message: 'Select a template:',
          choices: availableTemplates,
          default: getPrefOrDefault('template'),
        })
        options.template = template
        preferences.template = template
      }

      // Prompt for TypeScript
      if (!options.typescript && !options.javascript) {
        const { typescript } = await inquirer.prompt({
          type: 'confirm',
          name: 'typescript',
          message: `Would you like to use ${chalk.blue('TypeScript')}?`,
          default: getPrefOrDefault('typescript'),
        })
        options.typescript = typescript
        options.javascript = !typescript
        preferences.typescript = typescript
      }

      // Prompt for ESLint
      if (!options.eslint && !args.includes('--no-eslint')) {
        const { eslint } = await inquirer.prompt({
          type: 'confirm',
          name: 'eslint',
          message: `Would you like to use ${chalk.blue('ESLint')}?`,
          default: getPrefOrDefault('eslint'),
        })
        options.eslint = eslint
        preferences.eslint = eslint
      }

      // Prompt for Git
      if (!options.git && !args.includes('--no-git')) {
        const { git } = await inquirer.prompt({
          type: 'confirm',
          name: 'git',
          message: 'Initialize a git repository?',
          default: getPrefOrDefault('git'),
        })
        options.git = git
        preferences.git = git
      }
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

    // Save preferences for next time
    conf.set('preferences', preferences)

    // Create project
    spinner.start('Creating project...')
    await createProject({
      projectPath,
      template,
      typescript: options.typescript !== false, // Default to true
      eslint: options.eslint !== false, // Default to true
    })
    spinner.succeed('Project created')

    // Skip dependency installation if requested
    if (!options.skipInstall) {
      spinner.start(`Installing dependencies with ${packageManager}...`)
      await installDependencies(projectPath, packageManager)
      spinner.succeed('Dependencies installed')
    }

    // Initialize git if requested
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

    // Display success message
    console.log()
    console.log(
      `${chalk.green('Success!')} Created ${chalk.cyan(projectDirectory)} at ${chalk.cyan(projectPath)}`
    )
    console.log()

    // Get the run command function for the selected package manager
    const runCmd = getRunCommand(packageManager)

    // Display next steps
    console.log('Inside that directory, you can run several commands:')
    console.log()
    console.log(`  ${chalk.cyan(runCmd('dev'))}`)
    console.log('    Starts the development server.')
    console.log()
    console.log(`  ${chalk.cyan(runCmd('build'))}`)
    console.log('    Builds the app for production.')
    console.log()
    console.log(`  ${chalk.cyan(runCmd('start'))}`)
    console.log('    Runs the built app in production mode.')
    console.log()
    console.log('We suggest that you begin by typing:')
    console.log()
    console.log(`  ${chalk.cyan('cd')} ${projectDirectory}`)
    console.log(`  ${chalk.cyan(runCmd('dev'))}`)
    console.log()
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
