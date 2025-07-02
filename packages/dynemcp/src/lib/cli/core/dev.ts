import chalk from 'chalk'
import { getEffectiveTransport } from './utils'
import { DYNEMCP_SERVER } from '../../../global/config-all-contants'
import type { DevOptions } from './types'
import { launchInspector } from './inspector'
import { runDefaultMode } from './run-default-mode'

// Handler for the 'dev' command in DyneMCP CLI
// Decides between inspector mode and default dev mode, and handles startup errors.

function resolveMode(argv: DevOptions): string {
  const cliArg = argv._[1]
  return cliArg === 'inspector' || argv.mode === 'inspector'
    ? 'inspector'
    : 'default'
}

export async function dev(argv: DevOptions): Promise<void> {
  const mode = resolveMode(argv)

  try {
    if (mode === 'inspector') {
      console.log(DYNEMCP_SERVER.MESSAGES.STARTING_INSPECTOR)

      const { transport, port, host } = await getEffectiveTransport(argv)
      await launchInspector(transport, argv.config, port, host)
    } else {
      console.log(DYNEMCP_SERVER.MESSAGES.STARTING)
      await runDefaultMode(argv)
    }
  } catch (error) {
    console.error(DYNEMCP_SERVER.ERRORS.DEV_SERVER_FAILED)
    if (error instanceof Error) {
      console.error(chalk.red(error.message))
    }
    process.exit(1)
  }
}
