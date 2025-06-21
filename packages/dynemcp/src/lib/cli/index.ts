#!/usr/bin/env node

/**
 * DyneMCP CLI
 * Unified CLI for the DyneMCP framework
 * Usage: dynemcp <command> [options]
 */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import { build, watch, clean, analyze } from '../build/build-dynemcp.js'
import { createMCPServer } from '../server/core/server/server-dynemcp.js'
import { loadConfig } from '../server/core/config.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

// Logger interface and implementations
export interface Logger {
  log(message: string): void
  warn(message: string): void
  error(message: string): void
  info(message: string): void
  success(message: string): void
  debug(message: string): void
}

export class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message)
  }
  warn(message: string) {
    console.warn(chalk.yellow(message))
  }
  error(message: string) {
    console.error(chalk.red(message))
  }
  info(message: string) {
    console.info(chalk.blue(message))
  }
  success(message: string) {
    console.log(chalk.green(message))
  }
  debug(message: string) {
    console.debug(chalk.gray(message))
  }
}

export class StderrLogger implements Logger {
  log(message: string) {
    console.error(message)
  }
  warn(message: string) {
    console.error(chalk.yellow(message))
  }
  error(message: string) {
    console.error(chalk.red(message))
  }
  info(message: string) {
    console.error(chalk.blue(message))
  }
  success(message: string) {
    console.error(chalk.green(message))
  }
  debug(message: string) {
    console.error(chalk.gray(message))
  }
}

function findTsx(): string | null {
  // Find the tsx executable relative to our own package location
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  // from /dist/lib/cli -> ../../.. -> package root
  const packageRoot = path.resolve(__dirname, '..', '..', '..')
  const tsxPath = path.resolve(packageRoot, 'node_modules', '.bin', 'tsx')
  if (fs.existsSync(tsxPath)) {
    return tsxPath
  }
  return null
}

async function dev(argv: {
  internalRun?: boolean
  clean?: boolean
  config?: string
}) {
  const logger = argv.internalRun ? new StderrLogger() : new ConsoleLogger()

  if (!argv.internalRun) {
    logger.info('🕵️  Launching DyneMCP server with Inspector...')

    const tsxPath = findTsx()
    if (!tsxPath) {
      logger.error(
        '❌ Could not find `tsx`. Please install it with `pnpm install tsx`.'
      )
      process.exit(1)
    }
    const scriptPath = process.argv[1] // This is the path to our CLI script
    const serverArgs = process.argv.slice(2)
    // Ensure --internal-run is only added once.
    if (!serverArgs.includes('--internal-run')) {
      serverArgs.push('--internal-run')
    }

    const inspectorCmd = 'npx'
    const inspectorArgs = [
      '-y',
      '@modelcontextprotocol/inspector',
      tsxPath,
      scriptPath,
      ...serverArgs,
    ]

    const child = spawn(inspectorCmd, inspectorArgs, { stdio: 'inherit' })
    child.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Inspector exited with code ${code}`)
      }
      process.exit(code ?? 0)
    })
    return
  }
  try {
    logger.success('🚀 Starting DyneMCP development server (internal)...')

    const ctx = await watch({
      configPath: argv.config,
      clean: argv.clean,
      logger: logger,
    })

    const server = createMCPServer(undefined, argv.config)
    await server.start()

    logger.info('📁 Watching for changes...')

    process.on('SIGINT', async () => {
      logger.warn('\n🛑 Shutting down development server...')
      await server.stop()
      await ctx.dispose()
      process.exit(0)
    })
  } catch (error) {
    logger.error('❌ Failed to start development server.')
    if (error instanceof Error) {
      logger.error(error.message)
    }
    process.exit(1)
  }
}

const cli = yargs(hideBin(process.argv))
  .scriptName('dynemcp')
  .usage('$0 <cmd> [args]')
  .command(
    'dev',
    'Starts the DyneMCP server in development mode',
    (yargs) => {
      return yargs
        .option('internal-run', {
          type: 'boolean',
          hidden: true,
        })
        .option('clean', {
          type: 'boolean',
          describe: 'Clean before building',
        })
        .option('config', {
          alias: 'c',
          type: 'string',
          describe: 'Path to dynemcp.config.json',
        })
    },
    async (argv) => {
      await dev(argv)
    }
  )
  .command(
    'build',
    'Build the project for production',
    (yargs) => {
      return yargs
        .option('clean', {
          type: 'boolean',
          describe: 'Clean before building',
        })
        .option('analyze', {
          type: 'boolean',
          describe: 'Analyze dependencies after build',
        })
        .option('config', {
          alias: 'c',
          type: 'string',
          describe: 'Path to dynemcp.config.json',
        })
    },
    async (argv) => {
      console.log(chalk.green('🔨 Building DyneMCP project...'))
      await build({
        configPath: argv.config,
        clean: argv.clean,
        analyze: argv.analyze,
      })
    }
  )
  .command(
    'start',
    'Start the server in production mode',
    (yargs) => {
      return yargs.option('config', {
        alias: 'c',
        type: 'string',
        describe: 'Path to dynemcp.config.json',
      })
    },
    async (argv) => {
      console.log(chalk.green('🚀 Starting DyneMCP production server...'))
      const config = loadConfig(argv.config)
      const server = createMCPServer(
        config.server.name,
        argv.config,
        config.server.version
      )
      await server.start()
    }
  )
  .command(
    'clean',
    'Clean build directory',
    (yargs) => {
      return yargs.option('config', {
        alias: 'c',
        type: 'string',
        describe: 'Path to dynemcp.config.json',
      })
    },
    async (argv) => {
      console.log(chalk.green('🧹 Cleaning build directory...'))
      await clean({ configPath: argv.config })
    }
  )
  .command(
    'analyze',
    'Analyze dependencies',
    (yargs) => {
      return yargs.option('config', {
        alias: 'c',
        type: 'string',
        describe: 'Path to dynemcp.config.json',
      })
    },
    async (argv) => {
      console.log(chalk.green('📊 Analyzing dependencies...'))
      await analyze({ configPath: argv.config })
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .version()
  .alias('h', 'help')
  .alias('v', 'version')
  .strict()

cli.parse()

export { dev }
