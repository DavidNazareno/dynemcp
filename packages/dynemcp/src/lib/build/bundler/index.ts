/**
 * Advanced bundler module for DyneMCP projects
 * Based on esbuild with optimizations for MCP servers
 */

// All implementation logic has been moved to ./core/
// This file only re-exports the public API for the DyneMCP bundler

export * from './core/bundle'
export * from './core/analyzer'
export * from './core/manifest'
export * from './core/optimizer'
