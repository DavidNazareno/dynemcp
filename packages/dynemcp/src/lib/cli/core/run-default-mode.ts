// DyneMCP CLI - Default development mode runner
// Handles hot-reload, server startup, and graceful shutdown in dev mode.

import { watch } from '../../build'
import { createMCPServer } from '../../server'
import { ConsoleLogger, StderrLogger } from './logger'
import { TRANSPORT, DYNEMCP_SERVER } from '../../../global/config-all-contants'
import { getEffectiveTransport } from './utils'
import type { DevOptions } from './types'

export async function runDefaultMode(options: DevOptions): Promise<void> {
  const { transport, port, host } = await getEffectiveTransport(options)
  const silentMode = transport === TRANSPORT.TRANSPORT_TYPES.STDIO
  const logger =
    options.internalRun || silentMode ? new StderrLogger() : new ConsoleLogger()

  if (!silentMode) logger.success(DYNEMCP_SERVER.MESSAGES.STARTING)

  const ctx = await watch({
    configPath: options.config,
    clean: options.clean,
    logger,
  })

  const server = await createMCPServer(options.config)
  await server.start()

  if (!silentMode) {
    printServerInfo(logger, transport, host, port)
  }

  handleGracefulShutdown(server, ctx, logger, silentMode)
}

function printServerInfo(
  logger: ConsoleLogger | StderrLogger,
  transport: string,
  host?: string,
  port?: number
) {
  logger.info(DYNEMCP_SERVER.MESSAGES.WATCHING)

  if (transport === TRANSPORT.TRANSPORT_TYPES.STREAMABLE_HTTP) {
    const finalHost = host || TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.host
    const finalPort = port || TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.port

    logger.info(DYNEMCP_SERVER.MESSAGES.SERVER_RUNNING(finalHost, finalPort))
  }
}

function handleGracefulShutdown(
  server: Awaited<ReturnType<typeof createMCPServer>>,
  ctx: Awaited<ReturnType<typeof watch>>,
  logger: ConsoleLogger | StderrLogger,
  silent: boolean
) {
  process.on('SIGINT', async () => {
    if (!silent) {
      logger.warn(`\n${DYNEMCP_SERVER.MESSAGES.SHUTDOWN}`)
    }

    await server.stop()
    await ctx.dispose()

    process.exit(0)
  })
}
