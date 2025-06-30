/**
 * Main build module for DyneMCP projects
 * All implementation logic lives in ./core/
 * This file only re-exports the public API for the DyneMCP build system
 */

export * from './core/build'
export * from './core/build-cli'
export * from './core/watch'
export * from './core/clean'
export * from './core/analyze'
export * from './core/interfaces'
