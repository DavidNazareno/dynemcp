#!/usr/bin/env node

/**
 * DyneMCP CLI
 * Unified CLI for the DyneMCP framework
 * Usage: dynemcp <command> [options]
 */

import yargs, { Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import { build, watch, clean, analyze } from '../build/build-dynemcp.js'
import { createMCPServer } from '../server/core/server/server-dynemcp.js'
import { loadConfig } from '../server/core/config.js'

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

async function dev(argv: {
  internalRun?: boolean
  clean?: boolean
  config?: string
  transport?: string
}) {
  // Leer config para determinar el tipo de transporte
  const configPath = argv.config
  const transportType = argv.transport
  let configTransport: string | undefined
  if (configPath) {
    try {
      const config = await import(configPath)
      configTransport = config?.default?.transport?.type
    } catch {}
  }
  // Prioridad: CLI > config > stdio
  const effectiveTransport = transportType || configTransport || 'stdio'
  if (effectiveTransport === 'stdio') {
    process.env.DYNE_MCP_STDIO_LOG_SILENT = '1'
  }
  const logger =
    argv.internalRun || effectiveTransport === 'stdio'
      ? new StderrLogger()
      : new ConsoleLogger()

  // Eliminar el bloque que lanza el Inspector automáticamente
  // Solo iniciar el servidor y el watcher
  try {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
      logger.success('🚀 Starting DyneMCP development server (internal)...')

    const ctx = await watch({
      configPath: argv.config,
      clean: argv.clean,
      logger: logger,
    })

    const server = createMCPServer(undefined, argv.config)
    await server.start()

    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
      logger.info('📁 Watching for changes...')

    process.on('SIGINT', async () => {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
        logger.warn('\n🛑 Shutting down development server...')
      await server.stop()
      await ctx.dispose()
      process.exit(0)
    })
  } catch (error) {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
      logger.error('❌ Failed to start development server.')
    if (error instanceof Error) {
      if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) logger.error(error.message)
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
    (yargs: Argv) => {
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
        .option('transport', {
          type: 'string',
          describe: 'Transport type',
        })
    },
    async (argv: any) => {
      await dev(argv)
    }
  )
  .command(
    'build',
    'Build the project for production',
    (yargs: Argv) => {
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
    async (argv: any) => {
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
    (yargs: Argv) => {
      return yargs.option('config', {
        alias: 'c',
        type: 'string',
        describe: 'Path to dynemcp.config.json',
      })
    },
    async (argv: any) => {
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
    (yargs: Argv) => {
      return yargs.option('config', {
        alias: 'c',
        type: 'string',
        describe: 'Path to dynemcp.config.json',
      })
    },
    async (argv: any) => {
      console.log(chalk.green('🧹 Cleaning build directory...'))
      await clean({ configPath: argv.config })
    }
  )
  .command(
    'analyze',
    'Analyze dependencies',
    (yargs: Argv) => {
      return yargs.option('config', {
        alias: 'c',
        type: 'string',
        describe: 'Path to dynemcp.config.json',
      })
    },
    async (argv: any) => {
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
