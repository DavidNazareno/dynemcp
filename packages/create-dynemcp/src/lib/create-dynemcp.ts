/**
 * DyneMCP CLI Entrypoint
 *
 * This file is the executable entrypoint for the create-dynemcp CLI.
 * It simply delegates to the modular CLI implementation.
 */

import { run } from './cli/core/cli'

run().catch((e) => {
  console.error('Unexpected error:', e)
  process.exit(1)
})
