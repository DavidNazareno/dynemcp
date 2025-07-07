import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import chalk from 'chalk'

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
