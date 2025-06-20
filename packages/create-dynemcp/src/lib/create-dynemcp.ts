#!/usr/bin/env node

import path from 'path'
import chalk from 'chalk'
import { Command } from 'commander'
import inquirer from 'inquirer'
import ora from 'ora'
import { readFileSync } from 'fs'

// Import core functionality
import { createProject } from './core/create-project.js'
import { installDependencies } from './helpers/package-manager.js'
import { validateProjectName } from './helpers/validate.js'

// Get package version
const packageJson = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
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
  .option(
    '--template <name>',
    'The template to use (default, calculator)',
    'default'
  )
  .option('--skip-install', 'Skip installing dependencies')
  .option('-y, --yes', 'Skip all prompts and use default values')
  .allowUnknownOption()
  .parse(process.argv)

/**
 * Prompts the user for a project name
 */
async function promptForProjectName(): Promise<string> {
  const res = await inquirer.prompt({
    type: 'input',
    name: 'path',
    message: 'What is your project named?',
    default: 'my-mcp-project',
    validate: (name: string): boolean | string => {
      const validation = validateProjectName(name)
      if (validation.valid) return true
      return (
        'Invalid project name: ' + (validation.problems?.[0] ?? 'Invalid name')
      )
    },
  })

  return typeof res.path === 'string' ? res.path.trim() : 'my-mcp-project'
}

/**
 * Prompts the user for template selection
 */
async function promptForTemplate(): Promise<string> {
  const res = await inquirer.prompt({
    type: 'list',
    name: 'template',
    message: '🧩 Select a project template:',
    choices: [
      {
        name: 'Default project (minimal setup with examples)',
        value: 'default',
      },
      {
        name: 'Calculator project (with mathematical tools)',
        value: 'calculator',
      },
    ],
    default: 'default',
  })

  return res.template
}

/**
 * Main function
 */
async function run(): Promise<void> {
  try {
    const options = program.opts()
    const args = program.args

    // Get project directory
    let projectDirectory = args[0]
    if (!projectDirectory) {
      projectDirectory = await promptForProjectName()
    }

    // Get template
    let template = options.template
    if (!options.yes) {
      template = await promptForTemplate()
    }

    // Validate project name
    const { valid, problems } = validateProjectName(projectDirectory)
    if (!valid) {
      console.error(chalk.red(`Invalid project name: ${problems?.join(', ')}`))
      process.exit(1)
    }

    // Resolve project path
    const projectPath = path.resolve(process.cwd(), projectDirectory)
    const projectName = path.basename(projectPath)

    // Create project
    const spinner = ora('Creating project...').start()

    try {
      await createProject(projectPath, projectName, template)
      spinner.succeed('Project created successfully!')

      // Install dependencies
      if (!options.skipInstall) {
        spinner.text = 'Installing dependencies...'
        spinner.start()

        try {
          await installDependencies(projectPath)
          spinner.succeed('Dependencies installed successfully!')
        } catch (error) {
          spinner.fail('Failed to install dependencies')
          console.error(
            chalk.yellow('You can install dependencies manually by running:')
          )
          console.error(chalk.cyan(`  cd ${projectName}`))
          console.error(chalk.cyan('  npm install'))
        }
      }

      // Success message
      console.log()
      console.log(chalk.green('✨ Project created successfully!'))
      console.log()
      console.log('Next steps:')
      console.log(chalk.cyan(`  cd ${projectName}`))
      if (options.skipInstall) {
        console.log(chalk.cyan('  npm install'))
      }
      console.log(chalk.cyan('  npm run dev'))
      console.log()
      console.log('📚 Documentation: https://github.com/dynemcp/dynemcp')
      console.log()
    } catch (error) {
      spinner.fail('Failed to create project')
      console.error(
        chalk.red('Error:'),
        error instanceof Error ? error.message : error
      )
      process.exit(1)
    }
  } catch (error) {
    console.error(
      chalk.red('Error:'),
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}

// Run the CLI
run().catch((e) => {
  console.error(chalk.red('Unexpected error:'), e)
  process.exit(1)
})
