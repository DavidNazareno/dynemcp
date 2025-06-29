import yargs, { Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import { build, watch, clean, analyze } from '../../build/index.js'
import { createMCPServer } from '../../server/index.js'
import { loadConfig } from '../../server/config/index.js'
import { ConsoleLogger, StderrLogger } from './logger.js'
import { spawnProcess, getEffectiveTransport } from './utils.js'
import type { DevOptions } from './types.js'
import {
  DYNEMCP_CLI,
  DYNEMCP_SERVER,
  DYNEMCP_BUILD,
  DYNEMCP_INSPECTOR,
  CLI,
  getMcpEndpointUrl,
  getInspectorArgs,
  getInspectorSpawnOptions,
  setStdioLogSilent,
  isStdioLogSilent,
} from '../../../global/config-all-contants.js'

async function launchInspector(
  transportType: string,
  config?: string,
  port?: number,
  host?: string
): Promise<void> {
  if (transportType === CLI.TRANSPORT_TYPES[1]) {
    // 'streamable-http'
    const serverPort = port || DYNEMCP_CLI.DEFAULTS.port
    const serverHost = host || DYNEMCP_CLI.DEFAULTS.host
    const mcpEndpoint = getMcpEndpointUrl(serverHost, serverPort)
    console.log(DYNEMCP_SERVER.MESSAGES.STARTING_HTTP)
    const logger = new StderrLogger()
    // Start build/watch process
    console.log(DYNEMCP_SERVER.MESSAGES.BUILD_START)
    const ctx = await watch({
      configPath: config,
      clean: false,
      logger: logger,
    })
    console.log(DYNEMCP_SERVER.MESSAGES.BUILD_SUCCESS)
    // Start the MCP server
    const server = await createMCPServer(config)
    await server.start()
    console.log(
      DYNEMCP_SERVER.MESSAGES.HTTP_SERVER_READY(
        `http://${serverHost}:${serverPort}`
      )
    )
    console.log(chalk.cyan(`📡 MCP endpoint: ${mcpEndpoint}`))
    // Give the server a moment to fully initialize
    console.log(DYNEMCP_SERVER.MESSAGES.WAITING_SERVER)
    await new Promise((resolve) =>
      setTimeout(resolve, DYNEMCP_INSPECTOR.TIMING.SERVER_DELAY)
    )
    console.log(DYNEMCP_SERVER.MESSAGES.SERVER_READY)
    // Now launch the Inspector
    console.log(chalk.blue('🔍 Launching MCP Inspector...'))
    const inspectorArgs = getInspectorArgs(CLI.TRANSPORT_TYPES[1], mcpEndpoint)
    const inspectorProcess = spawnProcess(
      DYNEMCP_INSPECTOR.COMMANDS.PACKAGE_MANAGER,
      inspectorArgs,
      {
        stdio: 'inherit',
      }
    )
    // Handle cleanup
    const cleanup = async () => {
      console.log(chalk.yellow('\n🛑 Shutting down...'))
      inspectorProcess.kill('SIGTERM')
      await server.stop()
      await ctx.dispose()
      process.exit(0)
    }
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    await new Promise((resolve, reject) => {
      inspectorProcess.on('exit', (code: number | null) => {
        if (code === 0 || code === null) {
          resolve(undefined)
        } else {
          reject(new Error(`Inspector process exited with code ${code}`))
        }
      })
      inspectorProcess.on('error', (error: Error) => {
        reject(new Error(`Inspector process error: ${error.message}`))
      })
    })
  } else {
    // For stdio transport: build first, then launch inspector with build output
    console.log(DYNEMCP_SERVER.MESSAGES.STARTING_INSPECTOR_STDIO)
    console.log(DYNEMCP_SERVER.MESSAGES.BUILD_START)
    try {
      await build({ configPath: config })
      console.log(DYNEMCP_SERVER.MESSAGES.BUILD_SUCCESS)
    } catch (error) {
      console.error(DYNEMCP_SERVER.MESSAGES.BUILD_FAILED)
      throw error
    }
    console.log(DYNEMCP_SERVER.MESSAGES.INSPECTOR_STARTING)
    const inspectorArgs = getInspectorArgs(CLI.TRANSPORT_TYPES[0])
    const inspectorOptions = getInspectorSpawnOptions(CLI.TRANSPORT_TYPES[0])
    const inspectorProcess = spawnProcess(
      DYNEMCP_INSPECTOR.COMMANDS.PACKAGE_MANAGER,
      inspectorArgs,
      inspectorOptions
    )
    await new Promise((resolve, reject) => {
      inspectorProcess.on('exit', (code: number | null) => {
        if (code === 0 || code === null) {
          resolve(undefined)
        } else {
          reject(new Error(`Inspector process exited with code ${code}`))
        }
      })
      inspectorProcess.on('error', (error: Error) => {
        reject(new Error(`Inspector process error: ${error.message}`))
      })
    })
  }
}

async function dev(argv: DevOptions): Promise<void> {
  let mode = 'default'
  if (argv._.length > 1) {
    const modeArg = argv._[1]
    if (modeArg === 'inspector') {
      mode = 'inspector'
    }
  } else if (argv.mode) {
    mode = argv.mode
  }
  try {
    switch (mode) {
      case 'inspector': {
        console.log(DYNEMCP_SERVER.MESSAGES.STARTING_INSPECTOR)
        const {
          transport: effectiveTransport,
          port,
          host,
        } = await getEffectiveTransport(argv)
        await launchInspector(effectiveTransport, argv.config, port, host)
        break
      }
      case 'default':
      default:
        console.log(DYNEMCP_SERVER.MESSAGES.STARTING)
        await runDefaultMode(argv)
        break
    }
  } catch (error) {
    console.error(DYNEMCP_SERVER.ERRORS.DEV_SERVER_FAILED)
    if (error instanceof Error) {
      console.error(chalk.red(error.message))
    }
    process.exit(1)
  }
}

async function runDefaultMode(argv: DevOptions): Promise<void> {
  const {
    transport: effectiveTransport,
    port,
    host,
  } = await getEffectiveTransport(argv)
  if (effectiveTransport === CLI.TRANSPORT_TYPES[0]) {
    setStdioLogSilent(true)
  }
  const logger =
    argv.internalRun || effectiveTransport === CLI.TRANSPORT_TYPES[0]
      ? new StderrLogger()
      : new ConsoleLogger()
  if (!isStdioLogSilent()) {
    logger.success(DYNEMCP_SERVER.MESSAGES.STARTING)
  }
  const ctx = await watch({
    configPath: argv.config,
    clean: argv.clean,
    logger: logger,
  })
  const server = await createMCPServer(argv.config)
  await server.start()
  if (!isStdioLogSilent()) {
    logger.info(DYNEMCP_SERVER.MESSAGES.WATCHING)
    if (effectiveTransport === CLI.TRANSPORT_TYPES[1]) {
      logger.info(
        DYNEMCP_SERVER.MESSAGES.SERVER_RUNNING(
          host || DYNEMCP_CLI.DEFAULTS.host,
          port || DYNEMCP_CLI.DEFAULTS.port
        )
      )
    }
  }
  process.on('SIGINT', async () => {
    if (!isStdioLogSilent()) {
      logger.warn(`\n${DYNEMCP_SERVER.MESSAGES.SHUTDOWN}`)
    }
    await server.stop()
    await ctx.dispose()
    process.exit(0)
  })
}

const cli = yargs(hideBin(process.argv))
  .scriptName(DYNEMCP_CLI.SCRIPT_NAME)
  .usage(DYNEMCP_CLI.USAGE)
  .command(
    'dev [mode]',
    DYNEMCP_CLI.DESCRIPTIONS.DEV,
    (yargs: Argv) => {
      return yargs
        .positional('mode', {
          describe: DYNEMCP_CLI.DESCRIPTIONS.DEV_MODE,
          type: 'string',
          choices: ['inspector'],
        })
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
          describe: 'Transport type (stdio, streamable-http, console)',
        })
        .option('port', {
          type: 'number',
          describe: `Port for HTTP server (default: ${DYNEMCP_CLI.DEFAULTS.port})`,
          default: DYNEMCP_CLI.DEFAULTS.port,
        })
        .option('host', {
          type: 'string',
          describe: `Host for HTTP server (default: ${DYNEMCP_CLI.DEFAULTS.host})`,
          default: DYNEMCP_CLI.DEFAULTS.host,
        })
        .example(
          DYNEMCP_CLI.EXAMPLES.DEV,
          'Start development server (uses config transport)'
        )
        .example(
          DYNEMCP_CLI.EXAMPLES.DEV_INSPECTOR,
          DYNEMCP_CLI.DESCRIPTIONS.INSPECTOR
        )
    },
    async (argv: any) => {
      await dev(argv)
    }
  )
  .command(
    'build',
    DYNEMCP_CLI.DESCRIPTIONS.BUILD,
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
      console.log(DYNEMCP_BUILD.MESSAGES.BUILDING)
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
      const config = await loadConfig(argv.config)
      const server = await createMCPServer(config)
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

export { dev, cli }
