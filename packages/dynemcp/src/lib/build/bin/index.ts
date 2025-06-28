#!/usr/bin/env node

/**
 * DyneBuild CLI Entrypoint
 * All CLI logic lives in ./core/cli.ts
 */

import { run } from './core/cli.js'

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

run().catch((error) => {
  console.error(
    `❌ CLI failed: ${error instanceof Error ? error.message : String(error)}`
  )
  process.exit(1)
})
