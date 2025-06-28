/**
 * Main build module for DyneMCP projects
 * All implementation logic lives in ./core/
 * This file only re-exports the public API for the DyneMCP build system
 */

export * from './core/build.js'
export * from './core/build-cli.js'
export * from './core/watch.js'
export * from './core/clean.js'
export * from './core/analyze.js'
export * from './core/interfaces.js'
