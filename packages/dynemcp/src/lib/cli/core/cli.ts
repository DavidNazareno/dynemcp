// CLI entry point for DyneMCP
// Elimina cualquier comando relacionado con build, clean, serve, watch, etc. Solo deja los comandos relevantes para modo watch/dev.

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { launchInspectorProcess } from '../../server/main'
import { spawnProcess } from './utils'

const cli = yargs(hideBin(process.argv))
  .scriptName('dynemcp')
  .usage('$0 <cmd> [args]')
  .command(
    'dev [mode]',
    'Start development server (always in watch/hot reload mode)',
    (y) =>
      y.positional('mode', {
        describe: 'Development mode (default or inspector)',
        type: 'string',
        choices: ['default', 'inspector'],
        default: 'default',
      }),
    async (argv) => {
      const args = ['tsx', 'src/index.ts']
      if (argv.mode === 'inspector') {
        await launchInspectorProcess()
      } else {
        spawnProcess('npx', args)
      }
    }
  )
  .command('start', 'Start production server (no watch, no inspector)', () =>
    spawnProcess('npx', ['tsx', 'src/index.ts'])
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .version()
  .alias('h', 'help')
  .alias('v', 'version')
  .strict()

export { cli }
