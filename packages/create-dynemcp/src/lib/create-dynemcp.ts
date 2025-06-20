#!/usr/bin/env node

import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import Conf from 'conf';
import inquirer from 'inquirer';
import ora from 'ora';
import updateCheck from 'update-check';

// Import core functionality
import { getAvailableTemplates } from './core/create-project.js';
import { installTemplate } from './core/template-generator.js';

// Import helpers
import { validateProjectName, validateProjectPath, validateTemplate } from './helpers/validate.js';
import type { PackageManager } from './helpers/package-manager.js';
import type { CommandOptions, PackageInfo, UpdateInfo } from './core/interfaces.js';
import { installDependencies, getRunCommand } from './helpers/package-manager.js';
import { getPackageVersion } from './helpers/package-info.js';

const checkUpdate = updateCheck as unknown as (
  pkg: PackageInfo,
  config?: Record<string, unknown>,
) => Promise<UpdateInfo | null>;

// Get package version
const version = getPackageVersion();

// Program configuration
const program = new Command('create-dynemcp')
  .version(version, '-v, --version', 'Output the current version of create-dynemcp')
  .argument('[directory]', 'The directory to create the app in')
  .usage('[directory] [options]')
  .helpOption('-h, --help', 'Display this help message.')
  .option('--template <name>', 'The template to use (default, minimal, full)')
  .option('--ts, --typescript', 'Initialize as a TypeScript project (default)')
  .option('--eslint', 'Include ESLint configuration (default)')
  .option('--no-eslint', 'Skip ESLint configuration')
  .option('--use-npm', 'Explicitly tell the CLI to bootstrap the application using npm')
  .option('--use-pnpm', 'Explicitly tell the CLI to bootstrap the application using pnpm (default)')
  .option('--git', 'Initialize a git repository (default)')
  .option('--no-git', 'Skip git repository initialization')
  .option('--skip-install', 'Skip installing dependencies')
  .option('-y, --yes', 'Skip all prompts and use default values')
  .option('--reset, --reset-preferences', 'Reset the preferences saved for create-dynemcp')
  .allowUnknownOption()
  .parse(process.argv);

/**
 * Main function to run the CLI
 */
/**
 * Checks for available updates
 */
async function checkForUpdates(): Promise<void> {
  try {
    const pkgInfo = { name: 'create-dynemcp', version };
    const update = await checkUpdate(pkgInfo);
    if (update?.latest) {
      const updateMessage = `Update available! ${version} → ${update.latest}`;
      console.log();
      console.log(chalk.yellow(`${updateMessage}`));
      console.log(chalk.yellow('Run `pnpm i -g create-dynemcp` to update'));
      console.log();
    }
  } catch (_err) {
    // Ignore error
  }
}

// Function removed as it's now inlined in the run function

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
      const validation = validateProjectName(name);
      if (validation.valid) return true;
      return 'Invalid project name: ' + (validation.problems?.[0] ?? 'Invalid name');
    },
  });

  return typeof res.path === 'string' ? res.path.trim() : 'my-mcp-project';
}

/**
 * Prompts the user for project options
 */
async function promptForProjectOptions(
  options: CommandOptions,
  preferences: Record<string, boolean | string>,
  availableTemplates: string[],
  args: string[],
): Promise<void> {
  const defaults = {
    typescript: true,
    eslint: true,
    template: 'default',
    git: true,
  };

  const getPrefOrDefault = (field: string): boolean | string =>
    preferences[field] ?? defaults[field as keyof typeof defaults];

  // Prompt for template
  if (!options.template) {
    const { template } = await inquirer.prompt({
      type: 'list',
      name: 'template',
      message: 'Select a template:',
      choices: availableTemplates,
      default: getPrefOrDefault('template'),
    });
    options.template = template;
    preferences.template = template;
  }

  // Prompt for TypeScript
  if (!options.typescript && !options.javascript) {
    const { typescript } = await inquirer.prompt({
      type: 'confirm',
      name: 'typescript',
      message: `Would you like to use ${chalk.blue('TypeScript')}?`,
      default: getPrefOrDefault('typescript'),
    });
    options.typescript = typescript;
    options.javascript = !typescript;
    preferences.typescript = typescript;
  }

  // Prompt for ESLint
  if (!options.eslint && !args.includes('--no-eslint')) {
    const { eslint } = await inquirer.prompt({
      type: 'confirm',
      name: 'eslint',
      message: `Would you like to use ${chalk.blue('ESLint')}?`,
      default: getPrefOrDefault('eslint'),
    });
    options.eslint = eslint;
    preferences.eslint = eslint;
  }

  // Prompt for Git
  if (!options.git && !args.includes('--no-git')) {
    const { git } = await inquirer.prompt({
      type: 'confirm',
      name: 'git',
      message: 'Initialize a git repository?',
      default: getPrefOrDefault('git'),
    });
    options.git = git;
    preferences.git = git;
  }
}

/**
 * Validates the project configuration
 */
async function validateProjectConfiguration(
  projectDirectory: string,
  options: CommandOptions,
  availableTemplates: string[],
): Promise<string> {
  // Validate project name
  const { valid: validName, problems } = validateProjectName(projectDirectory);
  if (!validName) {
    console.error(chalk.red(`Invalid project name: ${problems?.join(', ')}`));
    process.exit(1);
  }

  // Create full project path
  const projectPath = path.resolve(process.cwd(), projectDirectory);

  // Validate project path
  const { valid: validPath, message } = validateProjectPath(projectPath);
  if (!validPath) {
    console.error(chalk.red(message));
    process.exit(1);
  }

  // Validate template
  const template = options.template ?? 'default';
  const { valid: validTemplate, message: templateMessage } = validateTemplate(
    template,
    availableTemplates,
  );
  if (!validTemplate) {
    console.error(chalk.red(templateMessage));
    process.exit(1);
  }

  return projectPath;
}

/**
 * Sets up the project by creating it and installing dependencies
 */
async function setupProject(
  projectPath: string,
  template: string,
  options: CommandOptions,
  packageManager: PackageManager,
  spinner: ReturnType<typeof ora>,
): Promise<void> {
  // Create project using template generator
  spinner.start('Creating project...');
  await installTemplate({
    appName: path.basename(projectPath),
    root: projectPath,
    packageManager,
    template,
    mode: options.typescript !== false ? 'ts' : 'js',
    tailwind: false, // Default to false, can be made configurable if needed
    eslint: options.eslint !== false, // Default to true
    srcDir: true, // Always use src directory for better organization
    importAlias: '@/*', // Default import alias
    skipInstall: options.skipInstall || false,
  });
  spinner.succeed('Project created');

  // Skip dependency installation if requested
  if (!options.skipInstall) {
    spinner.start(`Installing dependencies with ${packageManager}...`);
    await installDependencies(projectPath, packageManager);
    spinner.succeed('Dependencies installed');
  }

  // Initialize git if requested
  if (options.git !== false) {
    // Default to true
    spinner.start('Initializing git repository...');
    const { success } = await initGitRepo(projectPath);
    if (success) {
      spinner.succeed('Git repository initialized');
    } else {
      spinner.fail('Failed to initialize git repository');
    }
  }
}

/**
 * Displays success message and next steps
 */
function displaySuccessMessage(
  projectDirectory: string,
  projectPath: string,
  packageManager: PackageManager,
): void {
  console.log();
  console.log(
    `${chalk.green('Success!')} Created ${chalk.cyan(projectDirectory)} at ${chalk.cyan(
      projectPath,
    )}`,
  );
  console.log();

  // Get the run command function for the selected package manager
  const runCmd = getRunCommand(packageManager);

  // Display next steps
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(`  ${chalk.cyan(runCmd('dev'))}`);
  console.log('    Starts the development server.');
  console.log();
  console.log(`  ${chalk.cyan(runCmd('build'))}`);
  console.log('    Builds the app for production.');
  console.log();
  console.log(`  ${chalk.cyan(runCmd('start'))}`);
  console.log('    Runs the built app in production mode.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(`  ${chalk.cyan('cd')} ${projectDirectory}`);
  console.log(`  ${chalk.cyan(runCmd('dev'))}`);
  console.log();
  console.log('Happy hacking!');
}

async function run(): Promise<void> {
  const options = program.opts();
  const { args } = program;
  let projectDirectory = args[0];

  const spinner = ora();
  const conf = new Conf({ projectName: 'create-dynemcp' });

  // Check for updates
  await checkForUpdates();

  // Handle reset preferences option
  if (options.resetPreferences) {
    const { resetPreferences } = await inquirer.prompt({
      type: 'confirm',
      name: 'resetPreferences',
      message: 'Would you like to reset the saved preferences?',
      default: false,
    });

    if (resetPreferences) {
      conf.clear();
      console.log(chalk.green('The preferences have been reset successfully!'));
    }

    process.exit(0);
    return;
  }

  try {
    // Determine package manager - always use pnpm as per user rules
    const packageManager = 'pnpm' as PackageManager;

    const availableTemplates = await getAvailableTemplates();
    const preferences = (conf.get('preferences') ?? {}) as Record<string, boolean | string>;

    // Get project directory from user if not provided
    if (!projectDirectory) {
      projectDirectory = await promptForProjectName();
    }

    if (!projectDirectory) {
      console.log(
        '\nPlease specify the project directory:\n' +
          `  ${chalk.cyan('create-dynemcp')} ${chalk.green('<project-directory>')}\n` +
          'For example:\n' +
          `  ${chalk.cyan('create-dynemcp')} ${chalk.green('my-mcp-app')}\n\n` +
          `Run ${chalk.cyan('create-dynemcp --help')} to see all options.`,
      );
      projectDirectory = 'my-mcp-project';
    }

    // Skip prompts if --yes flag is provided
    if (!options.yes) {
      await promptForProjectOptions(options, preferences, availableTemplates, args);
    }

    // Ensure we have a project directory
    projectDirectory ??= 'my-mcp-project';

    // Validate project configuration
    const projectPath = await validateProjectConfiguration(
      projectDirectory,
      options,
      availableTemplates,
    );

    // Save preferences for next time
    conf.set('preferences', preferences);

    const template = options.template ?? 'default';

    // Create and set up the project
    await setupProject(projectPath, template, options, packageManager, spinner);

    // Display success message and next steps
    displaySuccessMessage(projectDirectory, projectPath, packageManager);
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

// Inicializar repositorio git
async function initGitRepo(projectPath: string): Promise<{ success: boolean }> {
  try {
    const { execa } = await import('execa');
    await execa('git', ['init'], { cwd: projectPath });
    await execa('git', ['add', '.'], { cwd: projectPath });
    await execa('git', ['commit', '-m', 'Initial commit from create-dynemcp'], {
      cwd: projectPath,
    });
    return { success: true };
  } catch (error) {
    console.error(
      `Failed to initialize git repository: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return { success: false };
  }
}

// Ejecutar la función principal
run().catch((error) => {
  console.error(
    chalk.red(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`),
  );
  process.exit(1);
});
