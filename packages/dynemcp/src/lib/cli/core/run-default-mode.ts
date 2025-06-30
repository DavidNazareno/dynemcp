import { watch } from '../../build'
import { createMCPServer } from '../../server'
import { ConsoleLogger, StderrLogger } from './logger'
import {
  setStdioLogSilent,
  isStdioLogSilent,
} from '../../../global/config-all-contants'
import { getEffectiveTransport } from './utils'
import {
  DYNEMCP_SERVER,
  DYNEMCP_CLI,
  CLI,
} from '../../../global/config-all-contants'
import type { DevOptions } from './types'

export async function runDefaultMode(argv: DevOptions): Promise<void> {
  const {
    transport: effectiveTransport,
    port,
    host,
  } = await getEffectiveTransport(argv)

  const isSilent = effectiveTransport === CLI.TRANSPORT_TYPES[0]
  if (isSilent) setStdioLogSilent(true)

  const logger =
    argv.internalRun || isSilent ? new StderrLogger() : new ConsoleLogger()

  if (!isStdioLogSilent()) {
    logger.success(DYNEMCP_SERVER.MESSAGES.STARTING)
  }

  const ctx = await watch({
    configPath: argv.config,
    clean: argv.clean,
    logger,
  })

  const server = await createMCPServer(argv.config)
  await server.start()

  logServerRunningInfo(logger, effectiveTransport, host, port)

  setupGracefulShutdown(logger, server, ctx)
}

function logServerRunningInfo(
  logger: ConsoleLogger | StderrLogger,
  transport: string,
  host?: string,
  port?: number
) {
  if (isStdioLogSilent()) return

  logger.info(DYNEMCP_SERVER.MESSAGES.WATCHING)

  if (transport === CLI.TRANSPORT_TYPES[1]) {
    logger.info(
      DYNEMCP_SERVER.MESSAGES.SERVER_RUNNING(
        host || DYNEMCP_CLI.DEFAULTS.host,
        port || DYNEMCP_CLI.DEFAULTS.port
      )
    )
  }
}

function setupGracefulShutdown(
  logger: ConsoleLogger | StderrLogger,
  server: Awaited<ReturnType<typeof createMCPServer>>,
  ctx: Awaited<ReturnType<typeof watch>>
) {
  process.on('SIGINT', async () => {
    if (!isStdioLogSilent()) {
      logger.warn(`\n${DYNEMCP_SERVER.MESSAGES.SHUTDOWN}`)
    }
    await server.stop()
    await ctx.dispose()
    process.exit(0)
  })
}
