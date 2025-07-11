#!/usr/bin/env node
import { run } from './lib/cli/core/cli'

run().catch((e) => {
  console.error('Unexpected error:', e)
  process.exit(1)
})
