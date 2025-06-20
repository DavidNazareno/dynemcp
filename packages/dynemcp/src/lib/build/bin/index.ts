#!/usr/bin/env node

/**
 * DyneBuild CLI
 * Advanced command line interface for building DyneMCP projects
 */
import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import { build, watch, buildCli, clean, analyze } from '../build-dynemcp.js'

interface CliOptions {
  config?: string
  clean?: boolean
  analyze?: boolean
  manifest?: boolean
  html?: boolean
  watch?: boolean
  cli?: boolean
  help?: boolean
  version?: boolean
}

function showHelp(): void {
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
  -c, --config <path>    Path to dynemcp.config.json (default: ./dynemcp.config.json)
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
  The builder reads from dynemcp.config.json in your project root.
  You can customize build settings in the "build" section of your config.
`)
}

function showVersion(): void {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')
  )
  console.log(`DyneBuild CLI v${packageJson.version}`)
}

function parseArgs(args: string[]): { command: string; options: CliOptions } {
  const options: CliOptions = {}
  let command = 'build'

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case 'build':
      case 'watch':
      case 'cli':
      case 'clean':
      case 'analyze':
        command = arg
        break
      case '-c':
      case '--config':
        options.config = args[++i]
        break
      case '--clean':
        options.clean = true
        break
      case '--analyze':
        options.analyze = true
        break
      case '--manifest':
        options.manifest = true
        break
      case '--html':
        options.html = true
        break
      case '--watch':
        options.watch = true
        break
      case '--cli':
        options.cli = true
        break
      case '-h':
      case '--help':
        options.help = true
        break
      case '-v':
      case '--version':
        options.version = true
        break
      default:
        if (arg.startsWith('-')) {
          console.warn(chalk.yellow(`⚠️  Unknown option: ${arg}`))
        }
    }
  }

  return { command, options }
}

async function run(): Promise<void> {
  try {
    const args = process.argv.slice(2)
    const { command, options } = parseArgs(args)

    // Show help or version
    if (options.help) {
      showHelp()
      return
    }

    if (options.version) {
      showVersion()
      return
    }

    // Get the current working directory
    const cwd = process.cwd()
    console.log(chalk.blue(`📁 Working directory: ${cwd}`))

    // Check if we're in a DyneMCP project
    const configPath = options.config || 'dynemcp.config.json'
    const absoluteConfigPath = path.isAbsolute(configPath)
      ? configPath
      : path.join(cwd, configPath)

    if (!fs.existsSync(absoluteConfigPath)) {
      console.error(
        chalk.red(`❌ Configuration file not found: ${absoluteConfigPath}`)
      )
      console.log(
        chalk.yellow(
          '💡 Make sure you are in a DyneMCP project directory or specify a config file with --config'
        )
      )
      process.exit(1)
    }

    console.log(chalk.blue(`📋 Using config: ${absoluteConfigPath}`))

    // Execute command
    switch (command) {
      case 'build': {
        console.log(chalk.green('🔨 Building DyneMCP project...'))
        const result = await build({
          configPath: absoluteConfigPath,
          clean: options.clean,
          analyze: options.analyze,
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
        const ctx = await watch({
          configPath: absoluteConfigPath,
          clean: options.clean,
        })

        // Keep the process running
        process.on('SIGINT', async () => {
          console.log(chalk.yellow('\n🛑 Stopping watch mode...'))
          await ctx.dispose()
          process.exit(0)
        })
        break
      }
      case 'cli': {
        console.log(chalk.green('🔧 Building CLI tool...'))
        const cliResult = await buildCli({
          configPath: absoluteConfigPath,
          clean: options.clean,
          analyze: options.analyze,
        })

        if (cliResult.success) {
          console.log(chalk.green('✅ CLI build completed successfully!'))
        } else {
          console.error(chalk.red('❌ CLI build failed!'))
          process.exit(1)
        }
        break
      }
      case 'clean': {
        console.log(chalk.green('🧹 Cleaning build directory...'))
        await clean({ configPath: absoluteConfigPath })
        console.log(chalk.green('✅ Clean completed!'))
        break
      }
      case 'analyze': {
        console.log(chalk.green('📊 Analyzing dependencies...'))
        await analyze({ configPath: absoluteConfigPath })
        break
      }
      default:
        console.error(chalk.red(`❌ Unknown command: ${command}`))
        showHelp()
        process.exit(1)
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(
    chalk.red('❌ Unhandled Rejection at:'),
    promise,
    chalk.red('reason:'),
    reason
  )
  process.exit(1)
})

// Execute the CLI
run().catch((error) => {
  console.error(
    chalk.red(
      `❌ CLI failed: ${error instanceof Error ? error.message : String(error)}`
    )
  )
  process.exit(1)
})
