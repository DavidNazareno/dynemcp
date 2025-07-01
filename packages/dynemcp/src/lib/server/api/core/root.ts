// root.ts
// Helpers para trabajar con Roots en MCP
// --------------------------------------

import type { Root, RootList } from './interfaces'

/**
 * Valida si un objeto es un Root válido.
 */
export function isRoot(obj: any): obj is Root {
  return obj && typeof obj === 'object' && typeof obj.uri === 'string'
}

/**
 * Valida si un objeto es una lista de Roots válida.
 */
export function isRootList(obj: any): obj is RootList {
  return Array.isArray(obj) && obj.every(isRoot)
}

/**
 * Parsea y normaliza una lista de roots desde cualquier entrada.
 */
export function parseRootList(input: any): RootList {
  if (isRootList(input)) return input
  if (input && typeof input === 'object' && Array.isArray(input.roots)) {
    return input.roots.filter(isRoot)
  }
  return []
}
