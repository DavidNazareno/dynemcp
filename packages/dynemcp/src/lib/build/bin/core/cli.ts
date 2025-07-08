// core/cli.ts
// DyneBuild CLI core logic for DyneMCP

import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import { build, watch, buildCli, clean, analyze } from '../../main'
import { PATHS } from '../../../../global/config-all-contants'

export interface CliOptions {
  config?: string
  clean: boolean
  analyze: boolean
  manifest: boolean
  html: boolean
  watch: boolean
  cli: boolean
  help: boolean
  version: boolean
}

export function showHelp(): void {
  console.log(`
${chalk.bold.blue('🚀 DyneBuild CLI')} - Advanced MCP Server Builder

${chalk.bold('Usage:')}
  dynebuild [command] [options]

${chalk.bold('Commands:')}
  build     Build the project (default)
  watch     Build in watch mode
  cli       Build CLI tool
  clean     Clean build directory
  analyze   Analyze dependencies

${chalk.bold('Options:')}
  -c, --config <path>    Path to ${PATHS.DEFAULT_CONFIG} (default: ./${PATHS.DEFAULT_CONFIG})
  --clean                Clean build directory before building
  --analyze              Analyze dependencies and generate report
  --manifest             Generate build manifest
  --html                 Generate HTML build report
  --watch                Build in watch mode
  --cli                  Build as CLI tool
  -h, --help             Show this help message
  -v, --version          Show version

${chalk.bold('Examples:')}
  dynebuild                    # Build with default config
  dynebuild --clean --analyze  # Clean and build with analysis
  dynebuild watch              # Build in watch mode
  dynebuild cli                # Build CLI tool
  dynebuild clean              # Clean build directory
  dynebuild analyze            # Analyze dependencies

${chalk.bold('Configuration:')}
  The builder reads from ${PATHS.DEFAULT_CONFIG} in your project root.
  You can customize build settings in the "build" section of your config.
`)
}

export function showVersion(): void {
  const pkgPath = path.join(__dirname, '../../package.json')
  const { version } = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  console.log(`DyneBuild CLI v${version}`)
}

export function parseArgs(args: string[]): {
  command: string
  options: CliOptions
} {
  const options: CliOptions = {
    clean: false,
    analyze: false,
    manifest: false,
    html: false,
    watch: false,
    cli: false,
    help: false,
    version: false,
  }
  let command = 'build'

  type BooleanFlags = Exclude<keyof CliOptions, 'config'>
  const flags: Record<string, BooleanFlags> = {
    '--clean': 'clean',
    '--analyze': 'analyze',
    '--manifest': 'manifest',
    '--html': 'html',
    '--watch': 'watch',
    '--cli': 'cli',
    '--help': 'help',
    '-h': 'help',
    '--version': 'version',
    '-v': 'version',
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (['build', 'watch', 'cli', 'clean', 'analyze'].includes(arg)) {
      command = arg
    } else if (arg === '-c' || arg === '--config') {
      options.config = args[++i]
    } else if (flags[arg]) {
      options[flags[arg]] = true
    } else if (arg.startsWith('-')) {
      console.warn(chalk.yellow(`⚠️  Unknown option: ${arg}`))
    }
  }

  return { command, options }
}

function resolveConfigPath(config?: string): string {
  const configPath = config || PATHS.DEFAULT_CONFIG
  const cwd = process.cwd()
  return path.isAbsolute(configPath) ? configPath : path.join(cwd, configPath)
}

function ensureConfigExists(configPath: string): void {
  if (!fs.existsSync(configPath)) {
    console.error(chalk.red(`❌ Configuration file not found: ${configPath}`))
    console.log(
      chalk.yellow(
        '💡 Make sure you are in a DyneMCP project directory or specify a config file with --config'
      )
    )
    process.exit(1)
  }
}

export async function run(): Promise<void> {
  try {
    const args = process.argv.slice(2)
    const { command, options } = parseArgs(args)

    if (options.help) {
      showHelp()
      return
    }
    if (options.version) {
      showVersion()
      return
    }

    const configPath = resolveConfigPath(options.config)
    console.log(chalk.blue(`📁 Working directory: ${process.cwd()}`))
    console.log(chalk.blue(`📋 Using config: ${configPath}`))
    ensureConfigExists(configPath)

    const sharedOptions = {
      configPath,
      clean: options.clean,
      analyze: options.analyze,
    }

    switch (command) {
      case 'build': {
        process.env.NODE_ENV = 'production'
        console.log(chalk.green('🔨 Building DyneMCP project...'))
        const result = await build({
          ...sharedOptions,
          manifest: options.manifest,
          html: options.html,
        })
        if (result.success) {
          console.log(chalk.green('✅ Build completed successfully!'))
        } else {
          console.error(chalk.red('❌ Build failed!'))
          process.exit(1)
        }
        break
      }
      case 'watch': {
        console.log(chalk.green('👀 Starting watch mode...'))
        const ctx = await watch(sharedOptions)
        process.on('SIGINT', async () => {
          console.log(chalk.yellow('\n🛑 Stopping watch mode...'))
          await ctx.dispose()
          process.exit(0)
        })
        break
      }
      case 'cli': {
        process.env.NODE_ENV = 'production'
        console.log(chalk.green('🔧 Building CLI tool...'))
        const result = await buildCli(sharedOptions)
        if (result.success) {
          console.log(chalk.green('✅ CLI build completed successfully!'))
        } else {
          console.error(chalk.red('❌ CLI build failed!'))
          process.exit(1)
        }
        break
      }
      case 'clean': {
        console.log(chalk.green('🧹 Cleaning build directory...'))
        await clean({ configPath })
        console.log(chalk.green('✅ Clean completed!'))
        break
      }
      case 'analyze': {
        console.log(chalk.green('📊 Analyzing dependencies...'))
        await analyze({ configPath })
        break
      }
      default: {
        console.error(chalk.red(`❌ Unknown command: ${command}`))
        showHelp()
        process.exit(1)
      }
    }
  } catch (error) {
    console.error(
      chalk.red(
        `❌ Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      )
    )
    process.exit(1)
  }
}

export default run
