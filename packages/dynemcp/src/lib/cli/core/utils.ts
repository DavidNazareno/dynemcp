import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import chalk from 'chalk'
import { loadConfig } from '../../server/config'
import { DYNEMCP_CLI, CLI } from '../../../global/config-all-contants'
import type { DevOptions } from './types'

// Utility functions for DyneMCP CLI
// Includes process spawning and transport/host/port resolution helpers.

// Spawns a child process with inherited stdio and error handling
export function spawnProcess(
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

// Resolves the effective transport, port, and host for the dev server
export async function getEffectiveTransport(argv: DevOptions): Promise<{
  transport: string
  port?: number
  host?: string
}> {
  const DEFAULT_CONFIG_PATH = 'dynemcp.config.ts'
  const configPath = argv.config || DEFAULT_CONFIG_PATH
  const transportType = argv.transport
  let configTransport: string | undefined
  let configPort: number | undefined
  let configHost: string | undefined
  try {
    const config = await loadConfig(configPath)
    configTransport = config?.transport?.type
    if (config?.transport?.type === CLI.TRANSPORT_TYPES[1]) {
      const httpConfig = config.transport as any
      if (httpConfig.options) {
        configPort = httpConfig.options.port
        configHost = httpConfig.options.host
      }
    }
  } catch (error) {
    if (argv.config) {
      console.warn(
        chalk.yellow(`Warning: Could not load config from ${configPath}:`),
        error
      )
    }
  }
  const effectiveTransport =
    transportType || configTransport || DYNEMCP_CLI.DEFAULTS.transport
  const effectivePort = argv.port || configPort || DYNEMCP_CLI.DEFAULTS.port
  const effectiveHost = argv.host || configHost || DYNEMCP_CLI.DEFAULTS.host
  return {
    transport: effectiveTransport,
    port: effectivePort,
    host: effectiveHost,
  }
}
