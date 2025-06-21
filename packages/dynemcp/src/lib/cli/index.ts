#!/usr/bin/env node

/**
 * DyneMCP CLI
 * Unified CLI for the DyneMCP framework
 * Usage: dynemcp <command> [options]
 */

import chalk from 'chalk'
import { build, watch, clean, analyze } from '../build/build-dynemcp.js'
import { createMCPServer } from '../server/core/server/server-dynemcp.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

interface CliOptions {
  config?: string
  clean?: boolean
  analyze?: boolean
  manifest?: boolean
  html?: boolean
  watch?: boolean
  port?: number
  host?: string
  help?: boolean
  version?: boolean
}

function showHelp(): void {
  console.log(`
${chalk.bold.blue('🚀 DyneMCP Framework')} - Complete MCP Framework

${chalk.bold('Usage:')}
  dynemcp <command> [options]

${chalk.bold('Commands:')}
  dev       Start development server with hot reload
  build     Build the project for production
  start     Start production server
  clean     Clean build directory
  analyze   Analyze dependencies

${chalk.bold('Options:')}
  -c, --config <path>    Path to dynemcp.config.json
  --clean                Clean before building
  --analyze              Analyze dependencies
  --manifest             Generate build manifest
  --html                 Generate HTML report
  --watch                Enable watch mode
  --port <number>        Server port (default: 3000)
  --host <string>        Server host (default: localhost)
  -h, --help             Show this help message
  -v, --version          Show version

${chalk.bold('Examples:')}
  dynemcp dev                    # Start development server
  dynemcp dev --port 3001        # Start on specific port
  dynemcp build                  # Build for production
  dynemcp build --clean --analyze # Clean build with analysis
  dynemcp start                  # Start production server
  dynemcp start --port 8080      # Start on specific port
  dynemcp clean                  # Clean build directory
  dynemcp analyze                # Analyze dependencies

${chalk.bold('Configuration:')}
  The framework reads from dynemcp.config.json in your project root.
  You can customize settings in the configuration file.
`)
}

function showVersion(): void {
  // Construct path to package.json robustly using import.meta.url
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const packageJsonPath = path.join(__dirname, '..', '..', '..', 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  console.log(`DyneMCP Framework v${packageJson.version}`)
}

function parseArgs(args: string[]): { command: string; options: CliOptions } {
  const options: CliOptions = {}
  let command = ''

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    // Check if it's a command
    if (['dev', 'build', 'start', 'clean', 'analyze'].includes(arg)) {
      command = arg
      continue
    }

    switch (arg) {
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
      case '--port':
        options.port = parseInt(args[++i])
        break
      case '--host':
        options.host = args[++i]
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

/**
 * Start development server
 */
async function dev(options: CliOptions): Promise<void> {
  try {
    console.log(chalk.green('🚀 Starting DyneMCP development server...'))

    // Start watch mode for build
    const ctx = await watch({
      configPath: options.config,
      clean: options.clean,
    })

    // Create and start server
    const server = createMCPServer()
    await server.start()

    console.log(chalk.green('✅ Development server started successfully!'))
    console.log(chalk.blue('📁 Watching for changes...'))

    const transportConfig = server.getConfig().transport
    if (
      transportConfig?.type === 'http-stream' &&
      transportConfig.options?.port
    ) {
      const port = transportConfig.options.port
      console.log(chalk.blue(`🌐 Server running at http://localhost:${port}`))
    } else {
      console.log(
        chalk.blue(
          `🌐 Server running on ${transportConfig?.type || 'stdio'} transport`
        )
      )
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Shutting down development server...'))
      await server.stop()
      await ctx.dispose()
      process.exit(0)
    })
  } catch (error) {
    console.error(chalk.red('❌ Failed to start development server:'), error)
    process.exit(1)
  }
}

/**
 * Start production server
 */
async function start(): Promise<void> {
  try {
    console.log(chalk.green('🚀 Starting DyneMCP production server...'))

    // Create and start server
    const server = createMCPServer()
    await server.start()

    console.log(chalk.green('✅ Production server started successfully!'))
    console.log(chalk.blue('🌐 Server running on stdio transport'))

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Shutting down production server...'))
      await server.stop()
      process.exit(0)
    })
  } catch (error) {
    console.error(chalk.red('❌ Failed to start production server:'), error)
    process.exit(1)
  }
}

async function run(): Promise<void> {
  try {
    const args = process.argv.slice(2)

    // Check if we are running in a tsx context
    if (!process.env.TSX_BIN) {
      const tsxPath = path.resolve(process.cwd(), 'node_modules', '.bin', 'tsx')
      if (fs.existsSync(tsxPath)) {
        const child = spawn(tsxPath, [process.argv[1], ...args], {
          stdio: 'inherit',
        })

        child.on('close', (code) => {
          process.exit(code ?? 0)
        })

        return
      }
    }

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

    // Execute command
    switch (command) {
      case 'dev':
        await dev(options)
        break

      case 'build': {
        console.log(chalk.green('🔨 Building DyneMCP project...'))
        const result = await build({
          configPath: options.config,
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

      case 'start':
        await start()
        break

      case 'clean': {
        console.log(chalk.green('🧹 Cleaning build directory...'))
        await clean({ configPath: options.config })
        console.log(chalk.green('✅ Clean completed!'))
        break
      }

      case 'analyze': {
        console.log(chalk.green('📊 Analyzing dependencies...'))
        await analyze({ configPath: options.config })
        break
      }

      default:
        if (!command) {
          console.error(chalk.red('❌ No command specified'))
          showHelp()
          process.exit(1)
        } else {
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

export { dev, start }
