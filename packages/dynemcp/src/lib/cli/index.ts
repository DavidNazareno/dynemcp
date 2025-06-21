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
import {
  createMCPServer,
  DyneMCP,
} from '../server/core/server/server-dynemcp.js'
import { loadConfig } from '../server/core/config.js'
import { type BuildContext } from 'esbuild'

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
    console.error(chalk.gray(message))
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

async function dev(argv: { config?: string }) {
  const logger =
    process.env.DYNEMCP_LOG_STDERR === 'true'
      ? new StderrLogger()
      : new ConsoleLogger()
  try {
    logger.success('🚀 Starting DyneMCP development server...')

    const config = loadConfig(argv.config)

    // --- Fix for dev mode ---
    // 1. Create a deep copy to avoid modifying the original object
    const devConfig = JSON.parse(JSON.stringify(config))

    // 2. Force transport to stdio if not specified, fixing the transport issue
    if (!devConfig.transport) {
      devConfig.transport = { type: 'stdio' }
    }
    // Set default to stdio for inspector
    devConfig.transport.type = devConfig.transport.type || 'stdio'

    // 3. Rewrite component paths to point to the build output directory
    const outDir = (config as any).build?.outDir ?? 'dist'
    const srcDir =
      (config as any).build?.srcDir ??
      (config.tools?.directory?.startsWith('src') ||
      config.resources?.directory?.startsWith('src') ||
      config.prompts?.directory?.startsWith('src')
        ? 'src'
        : '.')

    if (devConfig.tools?.directory) {
      devConfig.tools.directory = devConfig.tools.directory.replace(
        srcDir,
        outDir
      )
    }
    if (devConfig.resources?.directory) {
      devConfig.resources.directory = devConfig.resources.directory.replace(
        srcDir,
        outDir
      )
    }
    if (devConfig.prompts?.directory) {
      devConfig.prompts.directory = devConfig.prompts.directory.replace(
        srcDir,
        outDir
      )
    }
    // --- End fix ---

    let server: DyneMCP | null = null
    let ctx: BuildContext | null = null

    const startServer = async () => {
      if (server) return // Prevent starting multiple servers
      server = createMCPServer({ config: devConfig, logger })
      await server.start()
    }

    ctx = await watch({
      configPath: argv.config,
      logger: logger,
      onFirstBuildSuccess: startServer,
    })

    process.on('SIGINT', async () => {
      logger.warn('\n🛑 Shutting down development server...')
      if (server) await server.stop()
      if (ctx) await ctx.dispose()
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
      return yargs.option('config', {
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
      const server = createMCPServer({
        name: config.server.name,
        configPath: argv.config,
        version: config.server.version,
      })
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
