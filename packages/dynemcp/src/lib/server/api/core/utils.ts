// utils.ts
// Utility functions for DyneMCP API
// -----------------------------------
//
// - Centralizes common helpers for schema conversion, response formatting, error handling, pagination, and progress notifications.
// - Used throughout the API for robust and DRY code.

import { z } from 'zod'
import type { CallToolResult } from './interfaces'

/**
 * Helper function to convert Zod object schema to ZodRawShape
 */
export function zodObjectToRawShape<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T
): T['shape'] {
  return schema.shape
}

/**
 * Helper function to create a simple text response
 */
export function createTextResponse(text: string): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  }
}

/**
 * Helper function to create an error response
 */
export function createErrorResponse(error: Error): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: error.message,
      },
    ],
  }
}

/**
 * Helper function to wrap execution with proper error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => Promise<CallToolResult> {
  return async (...args: Parameters<T>) => {
    try {
      const result = await fn(...args)
      if (
        result &&
        typeof result === 'object' &&
        Array.isArray((result as any).content)
      ) {
        return result as CallToolResult
      }
      if (typeof result === 'string') {
        return createTextResponse(result)
      }
      if (result && typeof result === 'object' && 'text' in result) {
        return createTextResponse((result as any).text)
      }
      if (
        Array.isArray(result) &&
        result.every((item) => typeof item === 'string')
      ) {
        return {
          content: (result as string[]).map((text) => ({ type: 'text', text })),
        }
      }
      if (
        Array.isArray(result) &&
        result.every(
          (item) => item && typeof item === 'object' && 'text' in item
        )
      ) {
        return {
          content: (result as any[]).map((item) => ({
            type: 'text',
            text: item.text,
          })),
        }
      }
      return createTextResponse(JSON.stringify(result))
    } catch (error: unknown) {
      return createErrorResponse(error as Error)
    }
  }
}

/**
 * Helper for MCP-style cursor-based pagination over arrays.
 * @param items Array of items to paginate
 * @param cursor Opaque base64 cursor (stringified index)
 * @param pageSize Number of items per page (default: 50)
 * @returns { items: T[], nextCursor?: string }
 */
export function paginateWithCursor<T>(
  items: T[],
  cursor?: string,
  pageSize = 50
): { items: T[]; nextCursor?: string } {
  let start = 0
  if (cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
      const parsed = JSON.parse(decoded)
      if (
        typeof parsed === 'number' &&
        Number.isInteger(parsed) &&
        parsed >= 0
      ) {
        start = parsed
      } else {
        throw new Error('Invalid cursor')
      }
    } catch {
      throw Object.assign(new Error('Invalid cursor'), { code: -32602 })
    }
  }
  const end = start + pageSize
  const page = items.slice(start, end)
  let nextCursor: string | undefined
  if (end < items.length) {
    nextCursor = Buffer.from(JSON.stringify(end)).toString('base64')
  }
  return { items: page, nextCursor }
}

/**
 * Send a MCP progress notification if the client requested progress updates.
 *
 * @param extra The extra object from the MCP handler (includes sendNotification and _meta.progressToken)
 * @param params.progress Current progress value (number)
 * @param params.total Optional total value (number)
 * @param params.message Optional human-readable message
 */
export async function sendProgressNotification(
  extra: {
    _meta?: any
    sendNotification: (notification: any) => Promise<void>
  },
  {
    progress,
    total,
    message,
  }: { progress: number; total?: number; message?: string }
) {
  const token = extra._meta?.progressToken
  if (!token) return
  await extra.sendNotification({
    jsonrpc: '2.0',
    method: 'notifications/progress',
    params: {
      progressToken: token,
      progress,
      ...(typeof total === 'number' ? { total } : {}),
      ...(message ? { message } : {}),
    },
  })
}
