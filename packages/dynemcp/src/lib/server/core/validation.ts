import { z } from 'zod'
import type { ToolDefinition } from './interfaces.js'

/**
 * Validate that all schema fields have descriptions
 * This ensures tools are well-documented for MCP clients
 */
export function validateSchemaDescriptions(
  schema: z.ZodType,
  path = ''
): string[] {
  const errors: string[] = []

  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape()

    for (const [key, field] of Object.entries(shape)) {
      const fieldPath = path ? `${path}.${key}` : key

      // Check if field has description
      if (!(field as any)._def.description) {
        errors.push(`Field '${fieldPath}' is missing description`)
      }

      // Recursively validate nested objects
      if (field instanceof z.ZodObject) {
        errors.push(...validateSchemaDescriptions(field, fieldPath))
      }
    }
  }

  return errors
}

/**
 * Validate a tool schema and throw error if descriptions are missing
 */
export function validateToolSchema(schema: z.ZodType, toolName: string): void {
  const errors = validateSchemaDescriptions(schema)

  if (errors.length > 0) {
    throw new Error(
      `Tool '${toolName}' has schema validation errors:\n${errors
        .map((e) => `  - ${e}`)
        .join('\n')}`
    )
  }
}

/**
 * Validate all tools in the registry
 */
export function validateAllTools(tools: ToolDefinition[]): void {
  const allErrors: string[] = []

  for (const tool of tools) {
    try {
      // Basic validation that tool has required properties
      if (!tool.name || typeof tool.name !== 'string') {
        allErrors.push(`Tool is missing or has invalid name property`)
        continue
      }

      // Validate that tool has execute function
      if (!tool.execute || typeof tool.execute !== 'function') {
        allErrors.push(
          `Tool '${tool.name as string}' is missing execute function`
        )
        continue
      }

      // Validate inputSchema if present
      if (tool.inputSchema) {
        if (typeof tool.inputSchema !== 'object') {
          allErrors.push(
            `Tool '${tool.name as string}' has invalid inputSchema`
          )
        }
      }
    } catch (error) {
      allErrors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (allErrors.length > 0) {
    throw new Error(
      `Tool validation failed:\n${allErrors.map((e) => `  - ${e}`).join('\n')}`
    )
  }
}

/**
 * Helper function to define schemas with immediate validation
 */
export function defineSchema<T extends z.ZodType>(schema: T): T {
  // This is a placeholder for immediate validation
  // In a real implementation, you might want to validate at build time
  return schema
}
