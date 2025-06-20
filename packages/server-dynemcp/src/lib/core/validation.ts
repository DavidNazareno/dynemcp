import { z } from 'zod';

/**
 * Validate that all schema fields have descriptions
 * This ensures tools are well-documented for MCP clients
 */
export function validateSchemaDescriptions(schema: z.ZodType, path: string = ''): string[] {
  const errors: string[] = [];

  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();
    
    for (const [key, field] of Object.entries(shape)) {
      const fieldPath = path ? `${path}.${key}` : key;
      
      // Check if field has description
      if (!(field as any)._def.description) {
        errors.push(`Field '${fieldPath}' is missing description`);
      }
      
      // Recursively validate nested objects
      if (field instanceof z.ZodObject) {
        errors.push(...validateSchemaDescriptions(field, fieldPath));
      }
    }
  }

  return errors;
}

/**
 * Validate a tool schema and throw error if descriptions are missing
 */
export function validateToolSchema(schema: z.ZodType, toolName: string): void {
  const errors = validateSchemaDescriptions(schema);
  
  if (errors.length > 0) {
    throw new Error(
      `Tool '${toolName}' has schema validation errors:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Validate all tools in the registry
 */
export function validateAllTools(tools: Array<{ name: string; schema: any }>): void {
  const allErrors: string[] = [];

  for (const tool of tools) {
    try {
      if (tool.schema instanceof z.ZodType) {
        validateToolSchema(tool.schema, tool.name);
      }
    } catch (error) {
      allErrors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (allErrors.length > 0) {
    throw new Error(
      `Tool validation failed:\n${allErrors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Helper function to define schemas with immediate validation
 */
export function defineSchema<T extends z.ZodType>(schema: T): T {
  // This is a placeholder for immediate validation
  // In a real implementation, you might want to validate at build time
  return schema;
} 