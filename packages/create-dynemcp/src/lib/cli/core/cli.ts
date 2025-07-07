import path from 'path'
import chalk from 'chalk'
import { Command } from 'commander'
import inquirer from 'inquirer'
import ora from 'ora'
import { readFileSync } from 'fs'
import {
  createProject,
  installDependencies,
  validateProjectName,
} from '../../project'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageJsonPath = path.resolve(__dirname, '../../../package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
const version = packageJson.version

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

export async function promptForProjectName(): Promise<string> {
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

export async function promptForTemplate(): Promise<string> {
  const res = await inquirer.prompt({
    type: 'list',
    name: 'template',
    message: 'Select a project template:',
    choices: [
      {
        name: 'Default - Studio - A minimal setup with basic examples Transport: STUDIO',
        value: 'default-stdio',
      },
      {
        name: 'Default - HTTP - A minimal setup with basic examples Transport: STREAMABLE HTTP',
        value: 'default-http',
      },
    ],
    default: 'default-stdio',
  })
  return res.template
}

export async function run(): Promise<void> {
  try {
    const options = program.opts()
    const args = program.args
    let projectDirectory = args[0]
    if (!projectDirectory) {
      projectDirectory = await promptForProjectName()
    }
    let template = options.template
    if (!options.yes) {
      template = await promptForTemplate()
    }
    const { valid, problems } = validateProjectName(projectDirectory)
    if (!valid) {
      console.error(chalk.red(`Invalid project name: ${problems?.join(', ')}`))
      process.exit(1)
    }
    const projectPath = path.resolve(process.cwd(), projectDirectory)
    const projectName = path.basename(projectPath)
    const spinner = ora('Creating project...').start()
    try {
      await createProject(projectPath, projectName, template)
      spinner.succeed('Project created successfully!')
      if (!options.skipInstall) {
        spinner.text = 'Installing dependencies...'
        spinner.start()
        try {
          await installDependencies(projectPath)
          spinner.succeed('Dependencies installed successfully!')
        } catch (error) {
          console.error(error)
          spinner.fail('Failed to install dependencies')
          console.error(
            chalk.yellow('You can install dependencies manually by running:')
          )
          console.error(chalk.cyan(`  cd ${projectName}`))
          console.error(chalk.cyan('  pnpm install'))
        }
      }
      console.log()
      console.log(chalk.green('✨ Project created successfully!'))
      console.log()
      console.log('Next steps:')
      console.log(chalk.cyan(`  cd ${projectName}`))
      if (options.skipInstall) {
        console.log(chalk.cyan('  pnpm install'))
      }
      console.log(chalk.cyan('  pnpm run dev'))
      console.log()
      console.log('📚 Documentation: https://github.com/DavidNazareno/dynemcp')
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
