import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import chalk from 'chalk'
import {
  DEFAULT_CONFIG,
  loadConfig,
  TRANSPORT_TYPES,
} from '../../server/config'
import type { DevOptions } from './types'
import type { StreamableHTTPTransportConfig } from '../../server/config'

// Utility functions for DyneMCP CLI
// Includes process spawning and transport/host/port resolution helpers.

// Spawns a child process with inherited stdio and error handling
export function spawnProcess(command: string, args: string[]): ChildProcess {
  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  proc.on('error', (error) => {
    console.error(chalk.red(`Failed to start process: ${error.message}`))
  })
  return proc
}

export async function getEffectiveTransport(argv: DevOptions): Promise<{
  transport: string
  port?: number
  host?: string
  endpoint?: string
}> {
  const configPath = argv.config ?? DEFAULT_CONFIG
  const config = await loadConfig(configPath)

  const transportType = argv.transport ?? config.transport.type

  if (transportType === TRANSPORT_TYPES.STDIO) {
    return { transport: TRANSPORT_TYPES.STDIO }
  }

  const configOptions =
    (config.transport as StreamableHTTPTransportConfig)?.options ?? {}

  if (transportType === TRANSPORT_TYPES.HTTP) {
    return {
      transport: TRANSPORT_TYPES.HTTP,
      port: argv.port ?? configOptions.port,
      host: argv.host ?? configOptions.host,
      endpoint: configOptions.endpoint,
    }
  }

  return {
    transport: config.transport.type,
    port: configOptions.port,
    host: configOptions.host,
    endpoint: configOptions.endpoint,
  }
}
