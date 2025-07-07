/**
 * DyneMCP Framework Registry Module
 *
 * This module provides all registry types, schemas, utilities, and defaults
 * required for dynamically loading, caching, and managing tools, prompts, and resources.
 *
 * Exports:
 * - TypeScript interfaces and types for strong typing across the framework
 * - Zod schemas for runtime validation of registry items
 * - Utilities for loading and managing registry items
 * - Centralized default values for registry aspects
 * - Error handling utilities for registry-related issues
 */

// Main TypeScript types for registry items and interfaces
export type {
  RegistryItem,
  RegistryLoader,
  RegistryStorage,
  Registry,
} from './core/interfaces'

// Utilities for loading and managing registry items
export { DefaultRegistryLoader } from './core/loader'
export { InMemoryRegistryStorage } from './core/storage'
export { DyneMCPRegistry } from './core/registry'

// Error handling utilities for registry errors
export { RegistryItemNotFoundError, RegistryItemLoadError } from './core/errors'

// Zod schemas for runtime validation
export * from './core/schemas'
