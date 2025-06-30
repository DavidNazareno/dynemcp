// utils.ts
// Utility functions for the DyneMCP API module
// ---------------------------------------------

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
export function createErrorResponse(error: string | Error): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: error instanceof Error ? error.message : error,
      },
    ],
    isError: true,
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
      if (result && typeof result === 'object' && 'content' in result) {
        return result as CallToolResult
      }
      return createTextResponse(String(result))
    } catch (error: unknown) {
      return createErrorResponse(error as Error)
    }
  }
}
