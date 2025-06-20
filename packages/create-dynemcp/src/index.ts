#!/usr/bin/env node

// Main CLI entry point
export * from './lib/create-dynemcp.js'

// Core functionality
export * from './lib/core/create-project.js'
export * from './lib/core/template-generator.js'
export * from './lib/core/interfaces.js'

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./lib/create-dynemcp.js')
}
