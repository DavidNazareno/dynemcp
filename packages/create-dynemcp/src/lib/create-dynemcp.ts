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
 * Validates the project configuration and returns the resolved project path
 */
async function validateAndResolveProjectPath(
  projectDirectory: string,
  options: CommandOptions,
  availableTemplates: string[],
): Promise<{ projectPath: string; projectName: string }> {
  // Normalize the project directory name
  const projectName = projectDirectory.trim();

  // Validate project name
  const { valid: validName, problems } = validateProjectName(projectName);
  if (!validName) {
    console.error(chalk.red(`Invalid project name: ${problems?.join(', ')}`));
    process.exit(1);
  }

  // Get the actual current working directory where the command is executed
  const currentDir = process.cwd();

  // Handle both relative and absolute paths
  let projectPath: string;
  if (path.isAbsolute(projectName)) {
    projectPath = projectName;
  } else {
    projectPath = path.join(currentDir, projectName);
  }

  // Log where we're creating the project
  console.log(chalk.gray(`Current directory: ${currentDir}`));
  console.log(chalk.gray(`Creating project at: ${projectPath}`));

  // Validate project path (check if directory exists, etc.)
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

  return { projectPath, projectName: path.basename(projectPath) };
}

/**
 * Sets up the project by creating it and installing dependencies
 */
async function setupProject(
  projectPath: string,
  projectName: string,
  template: string,
  options: CommandOptions,
  packageManager: PackageManager,
  spinner: ReturnType<typeof ora>,
): Promise<void> {
  // Ensure the project directory doesn't exist or is empty
  const fs = await import('fs/promises');

  try {
    const stats = await fs.stat(projectPath);
    if (stats.isDirectory()) {
      const files = await fs.readdir(projectPath);
      if (files.length > 0) {
        throw new Error(`Directory ${projectPath} already exists and is not empty`);
      }
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    // Directory doesn't exist, which is fine
  }

  // Create project using template generator
  spinner.start('Creating project...');

  try {
    // Make sure we're passing the correct parameters
    await installTemplate({
      appName: projectName,
      root: projectPath,
      packageManager,
      template,
      mode: options.typescript !== false ? 'ts' : 'js',
      tailwind: false,
      eslint: options.eslint !== false,
      srcDir: false, // Changed to false to avoid src/src issue
      importAlias: '@/*',
      skipInstall: options.skipInstall || false,
    });
    spinner.succeed('Project created');
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(
      chalk.red(
        `Template installation error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
    throw error;
  }

  // Skip dependency installation if requested or if template already installed them
  if (!options.skipInstall) {
    spinner.start(`Installing dependencies with ${packageManager}...`);
    try {
      await installDependencies(projectPath, packageManager);
      spinner.succeed('Dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      console.error(
        chalk.red(
          `Dependency installation error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );
      throw error;
    }
  }

  // Initialize git if requested
  if (options.git !== false) {
    spinner.start('Initializing git repository...');
    const { success, error: gitError } = await initGitRepo(projectPath);
    if (success) {
      spinner.succeed('Git repository initialized');
    } else {
      spinner.warn(`Failed to initialize git repository: ${gitError || 'Unknown error'}`);
    }
  }
}

/**
 * Initialize git repository
 */
async function initGitRepo(projectPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { execa } = await import('execa');

    // Check if git is available
    try {
      await execa('git', ['--version']);
    } catch {
      return { success: false, error: 'Git is not installed or not available in PATH' };
    }

    // Initialize git repository
    await execa('git', ['init'], { cwd: projectPath });
    await execa('git', ['add', '.'], { cwd: projectPath });

    // Try to commit, but don't fail if git config is not set
    try {
      await execa('git', ['commit', '-m', 'Initial commit from create-dynemcp'], {
        cwd: projectPath,
      });
    } catch (commitError) {
      // If commit fails (usually due to missing git config), just init the repo
      return {
        success: true,
        error:
          'Git repository initialized but initial commit failed. You may need to configure git user.name and user.email',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Displays success message and next steps
 */
function displaySuccessMessage(
  projectName: string,
  projectPath: string,
  packageManager: PackageManager,
): void {
  console.log();
  console.log(
    `${chalk.green('Success!')} Created ${chalk.cyan(projectName)} at ${chalk.cyan(projectPath)}`,
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
  console.log(`  ${chalk.cyan('cd')} ${projectName}`);
  console.log(`  ${chalk.cyan(runCmd('dev'))}`);
  console.log();
  console.log('Happy hacking!');
}

/**
 * Determines the package manager to use
 */
function determinePackageManager(options: CommandOptions): PackageManager {
  if (options.usePnpm) {
    return 'pnpm';
  }

  // Default to pnpm as specified in the original code
  return 'pnpm';
}

/**
 * Main function to run the CLI
 */
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
    // Determine package manager
    const packageManager = determinePackageManager(options);

    // Get available templates
    const availableTemplates = await getAvailableTemplates();
    const preferences = (conf.get('preferences') ?? {}) as Record<string, boolean | string>;

    // Get project directory from user if not provided
    if (!projectDirectory) {
      if (options.yes) {
        projectDirectory = 'my-mcp-project';
      } else {
        projectDirectory = await promptForProjectName();
      }
    }

    // Ensure we have a valid project directory
    if (!projectDirectory || projectDirectory.trim() === '') {
      console.log(
        '\nPlease specify the project directory:\n' +
          `  ${chalk.cyan('create-dynemcp')} ${chalk.green('<project-directory>')}\n` +
          'For example:\n' +
          `  ${chalk.cyan('create-dynemcp')} ${chalk.green('my-mcp-app')}\n\n` +
          `Run ${chalk.cyan('create-dynemcp --help')} to see all options.`,
      );
      process.exit(1);
    }

    // Skip prompts if --yes flag is provided
    if (!options.yes) {
      await promptForProjectOptions(options, preferences, availableTemplates, args);
    } else {
      // Set defaults when using --yes flag
      options.template = options.template ?? 'default';
      options.typescript = options.typescript ?? true;
      options.eslint = options.eslint ?? true;
      options.git = options.git ?? true;
    }

    // Validate project configuration and get resolved paths
    const { projectPath, projectName } = await validateAndResolveProjectPath(
      projectDirectory,
      options,
      availableTemplates,
    );

    // Debug information
    console.log(chalk.gray(`Project directory input: "${projectDirectory}"`));
    console.log(chalk.gray(`Resolved project name: "${projectName}"`));
    console.log(chalk.gray(`Final project path: "${projectPath}"`));

    // Save preferences for next time
    conf.set('preferences', preferences);

    const template = options.template ?? 'default';

    // Create and set up the project
    await setupProject(projectPath, projectName, template, options, packageManager, spinner);

    // Display success message and next steps
    displaySuccessMessage(projectName, projectPath, packageManager);
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

// Run the main function
run().catch((error) => {
  console.error(
    chalk.red(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`),
  );
  process.exit(1);
});
