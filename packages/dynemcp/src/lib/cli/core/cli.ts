// CLI entry point for DyneMCP

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'

import { launchInspectorProcess } from '../../server/main'
import { spawnProcess } from './utils'

const cli = yargs(hideBin(process.argv))
  .scriptName('dynemcp')
  .usage(
    chalk.cyan('\n$0 <command> [options]\n\n') +
      chalk.bold('DyneMCP CLI') +
      '\n\n' +
      'Official CLI to develop and manage DyneMCP servers.\n'
  )
  .command(
    'dev [mode]',
    chalk.bold('Start the server in development mode (watch/hot reload).'),
    (y) =>
      y
        .positional('mode', {
          describe: 'Development mode ("default" or "inspector")',
          type: 'string',
          choices: ['default', 'inspector'],
          default: 'default',
        })
        .example('$0 dev', 'Start the server in default development mode')
        .example(
          '$0 dev inspector',
          'Start the server in inspector mode for debugging'
        ),
    async (argv) => {
      const args = ['tsx', 'src/index.ts']
      if (argv.mode === 'inspector') {
        await launchInspectorProcess()
      } else {
        spawnProcess('npx', args)
      }
    }
  )
  .command(
    'start',
    chalk.bold('Start the server in production mode.'),

    () => {
      spawnProcess('npx', ['tsx', 'src/index.ts'])
    }
  )
  .example('$0 start', 'Start the server in production mode')
  .demandCommand(
    1,
    chalk.red(
      'You must specify at least one command. Use --help to see available options.'
    )
  )
  .help('help')
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .epilog(
    chalk.gray(
      '\nFor more information, visit: https://dynemcp.pages.dev\n' +
        'Questions or issues? Report at https://github.com/DavidNazareno/dynemcp/issues'
    )
  )
  .strict()

export { cli }
