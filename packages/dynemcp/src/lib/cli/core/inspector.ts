import chalk from 'chalk'
import { watch, build } from '../../build'
import { createMCPServer } from '../../server'
import { StderrLogger } from './logger'
import { spawnProcess } from './utils'
import {
  DYNEMCP_SERVER,
  DYNEMCP_INSPECTOR,
  getInspectorArgs,
  TRANSPORT,
} from '../../../global/config-all-contants'

// Inspector launcher for DyneMCP CLI
// Handles launching the MCP Inspector in HTTP or stdio mode, including server startup and process management.

function waitForProcess(
  process: ReturnType<typeof spawnProcess>
): Promise<void> {
  return new Promise((resolve, reject) => {
    process.on('exit', (code: number | null) => {
      if (code === 0 || code === null) {
        resolve()
      } else {
        reject(new Error(`Inspector process exited with code ${code}`))
      }
    })
    process.on('error', (error: Error) => {
      reject(new Error(`Inspector process error: ${error.message}`))
    })
  })
}

async function launchHttpTransport(
  config?: string,
  port?: number,
  host?: string,
  endpoint?: string
) {
  const serverPort = port ?? TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.port
  const serverHost = host ?? TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.host
  const mcpEndpoint = `http://${serverHost}:${serverPort}${endpoint ?? TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.endpoint}`

  console.log(DYNEMCP_SERVER.MESSAGES.STARTING_HTTP)
  const logger = new StderrLogger()

  console.log(DYNEMCP_SERVER.MESSAGES.BUILD_START)
  const ctx = await watch({ configPath: config, clean: false, logger })
  console.log(DYNEMCP_SERVER.MESSAGES.BUILD_SUCCESS)

  const server = await createMCPServer(config)
  await server.start()

  console.log(
    DYNEMCP_SERVER.MESSAGES.HTTP_SERVER_READY(
      `http://${serverHost}:${serverPort}`
    )
  )
  console.log(chalk.cyan(`📡 MCP endpoint: ${mcpEndpoint}`))

  console.log(DYNEMCP_SERVER.MESSAGES.WAITING_SERVER)
  await new Promise((resolve) =>
    setTimeout(resolve, DYNEMCP_INSPECTOR.TIMING.SERVER_DELAY)
  )
  console.log(DYNEMCP_SERVER.MESSAGES.SERVER_READY)

  console.log(chalk.blue('🔍 Launching MCP Inspector...'))
  const inspectorArgs = getInspectorArgs(
    TRANSPORT.TRANSPORT_TYPES.STREAMABLE_HTTP,
    mcpEndpoint
  )
  const inspectorProcess = spawnProcess(
    DYNEMCP_INSPECTOR.COMMANDS.PACKAGE_MANAGER,
    inspectorArgs
  )

  const cleanup = async () => {
    console.log(chalk.yellow('\n🛑 Shutting down...'))
    inspectorProcess.kill('SIGTERM')
    await server.stop()
    await ctx.dispose()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  await waitForProcess(inspectorProcess)
}

async function launchStdioTransport(config?: string) {
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
  const serverCmd = 'node'
  const serverArgs = ['dist/server.js']
  const inspectorArgs = [
    '@modelcontextprotocol/inspector',
    serverCmd,
    ...serverArgs,
  ]

  const inspectorProcess = spawnProcess(
    DYNEMCP_INSPECTOR.COMMANDS.PACKAGE_MANAGER,
    inspectorArgs
  )

  await waitForProcess(inspectorProcess)
}

export async function launchInspector(
  transportType: string,
  config?: string,
  port?: number,
  host?: string,
  endpoint?: string
): Promise<void> {
  if (transportType === TRANSPORT.TRANSPORT_TYPES.STREAMABLE_HTTP) {
    await launchHttpTransport(config, port, host, endpoint)
  } else {
    await launchStdioTransport(config)
  }
}
