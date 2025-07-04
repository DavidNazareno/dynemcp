// CLI entry point for DyneMCP
// Sets up all main commands (dev, build, start, clean, analyze) using yargs and connects them to their handlers.
// Each command is configured with options and examples for developer usability.

import yargs, { type Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { DYNEMCP_CLI, TRANSPORT } from '../../../global/config-all-contants'
import { dev } from './dev'
import { buildHandler } from './handler/build'
import { startHandler } from './handler/start'
import { cleanHandler } from './handler/clean'
import { analyzeHandler } from './handler/analyze'
import type { DevOptions } from './types'

const addConfigOption = (y: Argv) =>
  y.option('config', {
    alias: 'c',
    type: 'string',
    describe: 'Path to dynemcp.config.ts',
  })

const cli = yargs(hideBin(process.argv))
  .scriptName(DYNEMCP_CLI.SCRIPT_NAME)
  .usage(DYNEMCP_CLI.USAGE)

  .command<DevOptions>(
    'dev [mode]',
    DYNEMCP_CLI.DESCRIPTIONS.DEV,
    (y) =>
      addConfigOption(y)
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
        .option('transport', {
          type: 'string',
          describe: 'Transport type (stdio, streamable-http, console)',
        })
        .option('port', {
          type: 'number',
          describe: `Port for HTTP server (default: ${TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.port})`,
          default: TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.port,
        })
        .option('host', {
          type: 'string',
          describe: `Host for HTTP server (default: ${TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.host})`,
          default: TRANSPORT.DEFAULT_TRANSPORT_HTTP_OPTIONS.host,
        })
        .example(DYNEMCP_CLI.EXAMPLES.DEV, 'Start development server')
        .example(
          DYNEMCP_CLI.EXAMPLES.DEV_INSPECTOR,
          DYNEMCP_CLI.DESCRIPTIONS.INSPECTOR
        ),
    dev
  )

  .command(
    'build',
    DYNEMCP_CLI.DESCRIPTIONS.BUILD,
    (y) =>
      addConfigOption(y)
        .option('clean', {
          type: 'boolean',
          describe: 'Clean before building',
        })
        .option('analyze', {
          type: 'boolean',
          describe: 'Analyze dependencies after build',
        }),
    buildHandler
  )

  .command(
    'start',
    'Start the server in production mode',
    addConfigOption,
    startHandler
  )

  .command('clean', 'Clean build directory', addConfigOption, cleanHandler)

  .command('analyze', 'Analyze dependencies', addConfigOption, analyzeHandler)

  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .version()
  .alias('h', 'help')
  .alias('v', 'version')
  .strict()

export { dev, cli }
