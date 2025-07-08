import chalk from 'chalk'
import { watch } from '../../build'
import { createMCPServer } from '../../server'
import {
  ConsoleLogger,
  fileLogger,
  StderrLogger,
  type Logger,
} from '../../../global/logger'
import { spawnProcess } from './utils'
import {
  DYNEMCP_SERVER,
  DYNEMCP_INSPECTOR,
  TRANSPORT,
} from '../../../global/config-all-contants'
import {
  DEFAULT_CONFIG,
  loadConfig,
  type DyneMCPConfig,
} from '../../server/config'
import type { StreamableHTTPTransportConfig } from '../../server/config/core/interfaces'
import type { DevOptions } from './types'

interface ServerContext {
  server: Awaited<ReturnType<typeof createMCPServer>>
  ctx: Awaited<ReturnType<typeof watch>>
  logger: Logger
}

async function launchServer(
  config: DyneMCPConfig,
  options: DevOptions
): Promise<ServerContext> {
  const silentMode = config.transport.type === TRANSPORT.TRANSPORT_TYPES.STDIO
  const logger =
    options.internalRun || silentMode ? new StderrLogger() : new ConsoleLogger()

  if (!silentMode) {
    logger.success(DYNEMCP_SERVER.MESSAGES.STARTING)
  }

  logger.info(DYNEMCP_SERVER.MESSAGES.BUILD_START)
  const ctx = await watch({
    configPath: DEFAULT_CONFIG,
    clean: false,
    logger,
  })
  logger.info(DYNEMCP_SERVER.MESSAGES.BUILD_SUCCESS)

  const server = await createMCPServer(config)
  await server.start()

  return { server, ctx, logger }
}

function waitForProcess(
  process: ReturnType<typeof spawnProcess>
): Promise<void> {
  return new Promise((resolve, reject) => {
    process.on('exit', (code: number | null) => {
      if (code === 0 || code === null) {
        resolve()
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })
    process.on('error', (error: Error) => {
      reject(new Error(`Process error: ${error.message}`))
    })
  })
}

async function launchInspectorProcess(
  transportType: string,
  endpoint?: string
) {
  fileLogger.info('🔍 Launching MCP Inspector...')

  const packageName = '@modelcontextprotocol/inspector'

  let inspectorArgs: string[]

  if (transportType === TRANSPORT.TRANSPORT_TYPES.HTTP) {
    if (!endpoint) {
      throw new Error('HTTP transport requires an endpoint URL')
    }
    // Para HTTP, la URL es el primer argumento
    inspectorArgs = [packageName, endpoint]
  } else {
    // Para STDIO, el comando es el primer argumento
    inspectorArgs = [packageName, 'node', 'dist/server.js']
  }

  const inspectorProcess = spawnProcess('npx', inspectorArgs)

  return inspectorProcess
}

function handleGracefulShutdown(
  serverCtx: ServerContext,
  inspectorProcess?: ReturnType<typeof spawnProcess>,
  silent = false
) {
  const cleanup = async () => {
    if (!silent) {
      serverCtx.logger.warn(`\n${DYNEMCP_SERVER.MESSAGES.SHUTDOWN}`)
    }

    if (inspectorProcess) {
      inspectorProcess.kill('SIGTERM')
    }

    await serverCtx.server.stop()
    await serverCtx.ctx.dispose()

    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

function printServerInfo(
  logger: Logger,
  transport: string,
  host?: string,
  port?: number
) {
  logger.info(DYNEMCP_SERVER.MESSAGES.WATCHING)

  if (transport === TRANSPORT.TRANSPORT_TYPES.HTTP) {
    const finalHost = host || TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.host
    const finalPort = port || TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.port
    logger.info(DYNEMCP_SERVER.MESSAGES.SERVER_RUNNING(finalHost, finalPort))
  }
}

async function runHttpMode(
  config: DyneMCPConfig,
  httpConfig: StreamableHTTPTransportConfig,
  options: DevOptions
) {
  const serverHost =
    httpConfig.options?.host ?? TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.host
  const serverPort =
    httpConfig.options?.port ?? TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.port
  const endpoint =
    httpConfig.options?.endpoint ??
    TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.endpoint

  const mcpEndpoint = `http://${serverHost}:${serverPort}${endpoint}`
  const serverCtx = await launchServer(config, options)

  printServerInfo(
    serverCtx.logger,
    config.transport.type,
    serverHost,
    serverPort
  )

  if (options.mode === 'inspector') {
    serverCtx.logger.info(DYNEMCP_SERVER.MESSAGES.WAITING_SERVER)
    await new Promise((resolve) =>
      setTimeout(resolve, DYNEMCP_INSPECTOR.TIMING.SERVER_DELAY)
    )
    serverCtx.logger.info(DYNEMCP_SERVER.MESSAGES.SERVER_READY)

    const inspectorProcess = await launchInspectorProcess(
      TRANSPORT.TRANSPORT_TYPES.HTTP,
      mcpEndpoint
    )

    handleGracefulShutdown(serverCtx, inspectorProcess)
    await waitForProcess(inspectorProcess)
  } else {
    handleGracefulShutdown(serverCtx)
  }
}

async function runStdioMode(config: DyneMCPConfig, options: DevOptions) {
  const serverCtx = await launchServer(config, options)

  if (options.mode === 'inspector') {
    const inspectorProcess = await launchInspectorProcess(
      TRANSPORT.TRANSPORT_TYPES.STDIO
    )

    handleGracefulShutdown(serverCtx, inspectorProcess, true)
    await waitForProcess(inspectorProcess)
  } else {
    handleGracefulShutdown(serverCtx, undefined, true)
  }
}

export async function run(options: DevOptions): Promise<void> {
  try {
    const config = await loadConfig(DEFAULT_CONFIG)

    if (config.transport.type === TRANSPORT.TRANSPORT_TYPES.HTTP) {
      const httpConfig = config.transport as StreamableHTTPTransportConfig
      await runHttpMode(config, httpConfig, options)
    } else {
      await runStdioMode(config, options)
    }
  } catch (error) {
    console.error(DYNEMCP_SERVER.ERRORS.DEV_SERVER_FAILED)
    if (error instanceof Error) {
      console.error(chalk.red(error.message))
    }
    process.exit(1)
  }
}
