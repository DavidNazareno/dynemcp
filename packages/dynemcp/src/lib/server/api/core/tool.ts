// tool.ts
// Functional API for DyneMCP Tools
// -----------------------------------

import { z } from 'zod'
import type { LoadedTool, CallToolResult } from './interfaces'

/**
 * Tipo MCP para un item de content de tool
 */
export type ContentItem =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'embedded_resource'; uri: string; [key: string]: any }
  | { type: string; [key: string]: any }

/**
 * Normaliza el resultado de una tool para cumplir el protocolo MCP.
 * - Si es string: lo convierte a content:text
 * - Si es objeto MCP válido: lo respeta
 * - Si es ContentItem: lo envuelve
 * - Si es objeto simple { text: ... }: lo convierte a content:text
 * - Si es array: normaliza cada elemento
 * - Si es objeto no válido: retorna error MCP
 */
function normalizeToolResult(result: any) {
  // String simple
  if (typeof result === 'string') {
    return { content: [{ type: 'text', text: result }] }
  }
  // Objeto MCP válido
  if (result && typeof result === 'object' && Array.isArray(result.content)) {
    return result
  }
  // ContentItem
  if (
    result &&
    typeof result === 'object' &&
    result.type &&
    (result.text || result.url || result.uri)
  ) {
    return { content: [result] }
  }
  // Objeto simple { text: ... }
  if (
    result &&
    typeof result === 'object' &&
    'text' in result &&
    !result.type
  ) {
    return { content: [{ type: 'text', text: result.text }] }
  }
  // Array de strings u objetos
  if (Array.isArray(result)) {
    const content = result.map((item) => {
      if (typeof item === 'string') {
        return { type: 'text', text: item }
      }
      if (item && typeof item === 'object' && 'text' in item && !item.type) {
        return { type: 'text', text: item.text }
      }
      if (
        item &&
        typeof item === 'object' &&
        item.type &&
        (item.text || item.url || item.uri)
      ) {
        return item
      }
      // Si no es válido, lo stringifica
      return { type: 'text', text: JSON.stringify(item) }
    })
    return { content }
  }
  // Si es un objeto no válido, retorna error MCP
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: `Invalid tool return value: ${JSON.stringify(result)}`,
      },
    ],
  }
}

/**
 * Wrapper para manejo de errores y normalización de retorno MCP
 */
function withErrorHandling<T extends (...args: any[]) => any>(fn: T): T {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args)
      return normalizeToolResult(result)
    } catch (error: any) {
      return {
        isError: true,
        content: [
          { type: 'text', text: `Error: ${error?.message || String(error)}` },
        ],
      }
    }
  }) as T
}

/**
 * Simplified typed tool creator function
 */
export function createTypedTool<T extends z.ZodObject<z.ZodRawShape>>(config: {
  name: string
  description: string
  schema: T
  inputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
  outputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
  annotations?: Record<string, unknown>
  execute: (
    input: z.infer<T>
  ) => Promise<CallToolResult> | CallToolResult | string | unknown
  complete?: (params: {
    argument: string
    partialInput: string
    context?: Record<string, unknown>
  }) => Promise<string[]> | string[]
}): LoadedTool {
  return {
    name: config.name,
    description: config.description,
    inputSchema: config.inputSchema ?? config.schema.shape,
    outputSchema: config.outputSchema,
    annotations: config.annotations,
    execute: withErrorHandling(config.execute as any),
    parameters: {}, // Optionally fill if needed
    complete: config.complete,
  }
}

/**
 * Nueva API funcional para definir herramientas (tools) de DyneMCP.
 * Permite una sintaxis simple y flexible:
 *
 * export default tool(schema, handler, options)
 *
 * El handler puede retornar:
 *   - string (se normaliza a content:text)
 *   - ContentItem
 *   - ContentItem[]
 *   - { content: ContentItem[] }
 *   - { isError: true, content: ContentItem[] }
 */
export function tool<
  T extends z.ZodObject<z.ZodRawShape>,
  Meta extends Record<string, any> = Record<string, any>,
>(
  schema: T,
  handler: (input: z.infer<T>) => Promise<any> | any,
  options: {
    name: string
    description?: string
    inputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
    outputSchema?: z.ZodRawShape | z.ZodObject<any, any, any>
    annotations?: Record<string, unknown>
    meta?: Meta
    complete?: (params: {
      argument: string
      partialInput: string
      context?: Record<string, unknown>
    }) => Promise<string[]> | string[]
  }
): LoadedTool {
  return {
    name: options.name,
    description: options.description ?? '',
    inputSchema: options.inputSchema ?? schema.shape,
    outputSchema: options.outputSchema,
    annotations: options.annotations ?? options.meta,
    execute: withErrorHandling(handler as any),
    parameters: {}, // Optionally fill if needed
    complete: options.complete,
  }
}
