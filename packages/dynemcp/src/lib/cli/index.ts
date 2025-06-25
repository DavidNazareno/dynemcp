#!/usr/bin/env node

/**
 * DyneMCP CLI
 * Unified CLI for the DyneMCP framework
 * Usage: dynemcp <command> [options]
 */

import yargs, { Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import { spawn, ChildProcess } from 'child_process'
import { build, watch, clean, analyze } from '../build/build-dynemcp.js'
import { createMCPServer } from '../server/core/server/server-dynemcp.js'
import { loadConfig } from '../server/core/config.js'

// Import configuration
import {
  DYNEMCP_CLI,
  DYNEMCP_SERVER,
  DYNEMCP_BUILD,
  DYNEMCP_TRANSPORT,
  DYNEMCP_INSPECTOR,
  CLI,
  getMcpEndpointUrl,
  getInspectorArgs,
  getInspectorSpawnOptions,
  setStdioLogSilent,
  isStdioLogSilent,
  type DevMode,
} from '../../config.js'

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

// Development mode types
type DevOptions = {
  mode?: DevMode
  internalRun?: boolean
  clean?: boolean
  config?: string
  transport?: string
  port?: number
  host?: string
}

/**
 * Spawn a child process and return it
 */
function spawnProcess(
  command: string,
  args: string[],
  options: any = {}
): ChildProcess {
  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  })

  proc.on('error', (error) => {
    console.error(chalk.red(`Failed to start process: ${error.message}`))
  })

  return proc
}

/**
 * Determine the effective transport type from config and options
 */
function getEffectiveTransport(argv: DevOptions): {
  transport: string
  port?: number
  host?: string
} {
  const configPath = argv.config || DYNEMCP_TRANSPORT.CONFIG_PATHS.PRIMARY
  const transportType = argv.transport
  let configTransport: string | undefined
  let configPort: number | undefined
  let configHost: string | undefined

  // Load config to determine transport type
  try {
    const config = loadConfig(configPath)
    configTransport = config?.transport?.type
    // Check if transport has streamable-http options
    if (config?.transport?.type === CLI.TRANSPORT_TYPES[1]) {
      // 'streamable-http'
      const httpConfig = config.transport as any
      if (httpConfig.options) {
        configPort = httpConfig.options.port
        configHost = httpConfig.options.host
      }
    }
  } catch (error) {
    // Only warn if a specific config path was provided but failed to load
    if (argv.config) {
      console.warn(
        chalk.yellow(`Warning: Could not load config from ${configPath}:`),
        error
      )
    }
    // If no config file exists and none was specified, that's okay - use defaults
  }

  // Priority: CLI > config > stdio
  const effectiveTransport =
    transportType || configTransport || DYNEMCP_CLI.DEFAULTS.transport
  const effectivePort = argv.port || configPort || DYNEMCP_CLI.DEFAULTS.port
  const effectiveHost = argv.host || configHost || DYNEMCP_CLI.DEFAULTS.host

  // Debug logging (commented out for cleaner output)
  // console.log(chalk.gray(`🔍 Debug: Transport detection:`))
  // console.log(chalk.gray(`  - Config path: ${configPath}`))
  // console.log(chalk.gray(`  - Config transport: ${configTransport}`))
  // console.log(chalk.gray(`  - CLI transport: ${transportType}`))
  // console.log(chalk.gray(`  - Effective transport: ${effectiveTransport}`))
  // console.log(chalk.gray(`  - Port: ${effectivePort}, Host: ${effectiveHost}`))

  return {
    transport: effectiveTransport,
    port: effectivePort,
    host: effectiveHost,
  }
}

/**
 * Launch MCP Inspector based on transport type
 */
async function launchInspector(
  transportType: string,
  config?: string,
  port?: number,
  host?: string
): Promise<void> {
  // Debug logging (commented out for cleaner output)
  // console.log(chalk.gray(`🔍 Debug: launchInspector called with transport: ${transportType}`))

  if (transportType === CLI.TRANSPORT_TYPES[1]) {
    // 'streamable-http'
    // For HTTP transport: start the server using the same flow as runDefaultMode
    const serverPort = port || DYNEMCP_CLI.DEFAULTS.port
    const serverHost = host || DYNEMCP_CLI.DEFAULTS.host
    const mcpEndpoint = getMcpEndpointUrl(serverHost, serverPort)

    console.log(DYNEMCP_SERVER.MESSAGES.STARTING_HTTP)

    // Use the same server creation flow as runDefaultMode
    const logger = new StderrLogger()

    // Start build/watch process
    console.log(DYNEMCP_SERVER.MESSAGES.BUILD_START)
    const ctx = await watch({
      configPath: config,
      clean: false,
      logger: logger,
    })
    console.log(DYNEMCP_SERVER.MESSAGES.BUILD_SUCCESS)

    // Start the MCP server (same as runDefaultMode)
    const server = createMCPServer(undefined, config)
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
    const inspectorArgs = getInspectorArgs(CLI.TRANSPORT_TYPES[1], mcpEndpoint) // 'streamable-http'

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
      inspectorProcess.on('exit', (code) => {
        if (code === 0 || code === null) {
          resolve(undefined)
        } else {
          reject(new Error(`Inspector process exited with code ${code}`))
        }
      })

      inspectorProcess.on('error', (error) => {
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

    const inspectorArgs = getInspectorArgs(CLI.TRANSPORT_TYPES[0]) // 'stdio'
    const inspectorOptions = getInspectorSpawnOptions(CLI.TRANSPORT_TYPES[0]) // 'stdio'

    const inspectorProcess = spawnProcess(
      DYNEMCP_INSPECTOR.COMMANDS.PACKAGE_MANAGER,
      inspectorArgs,
      inspectorOptions
    )

    await new Promise((resolve, reject) => {
      inspectorProcess.on('exit', (code) => {
        if (code === 0 || code === null) {
          resolve(undefined)
        } else {
          reject(new Error(`Inspector process exited with code ${code}`))
        }
      })

      inspectorProcess.on('error', (error) => {
        reject(new Error(`Inspector process error: ${error.message}`))
      })
    })
  }
}

/**
 * Main dev function that handles all development modes
 */
async function dev(argv: DevOptions & { _: any[] }): Promise<void> {
  // Extract mode from positional arguments or mode option
  let mode: DevMode = 'default'

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
        const { transport, port, host } = getEffectiveTransport(argv)
        await launchInspector(transport, argv.config, port, host)
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

/**
 * Run default development mode (original behavior)
 */
async function runDefaultMode(argv: DevOptions): Promise<void> {
  const {
    transport: effectiveTransport,
    port,
    host,
  } = getEffectiveTransport(argv)

  if (effectiveTransport === CLI.TRANSPORT_TYPES[0]) {
    // 'stdio'
    setStdioLogSilent(true)
  }

  // Special 'console' transport for development logs (don't silence)
  if (effectiveTransport === CLI.TRANSPORT_TYPES[2]) {
    // 'console'
    setStdioLogSilent(false)
  }

  const logger =
    argv.internalRun || effectiveTransport === CLI.TRANSPORT_TYPES[0] // 'stdio'
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

  const server = createMCPServer(undefined, argv.config)
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

export { dev, cli }
