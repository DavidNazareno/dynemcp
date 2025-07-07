import type { DevOptions } from './types'
import { run } from './run'

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
  argv.mode = mode as 'inspector' | 'default'
  await run(argv)
}
