#!/usr/bin/env node

/* // Main CLI entry point
export * from './lib/create-dynemcp'

// Core functionality
export * from './lib/template/core/template-generator'
export * from './lib/template/core/interfaces'

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./lib/create-dynemcp')
  }
  */

export * from './lib/project/core/create-project'
export * from './lib'
