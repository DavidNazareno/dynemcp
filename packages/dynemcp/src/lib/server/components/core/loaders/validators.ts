// validators.ts
// Type guards for validating dynamically loaded components in the DyneMCP framework

import {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../../../api/index.js'

/**
 * Checks if a value is a valid ToolDefinition.
 * Used to ensure dynamically loaded modules conform to the expected tool contract.
 */
export function validateTool(component: unknown): component is ToolDefinition {
  return (
    component !== null &&
    typeof component === 'object' &&
    'name' in component &&
    typeof (component as any).name === 'string' &&
    ('description' in component === false ||
      typeof (component as any).description === 'string') &&
    ('inputSchema' in component || 'parameters' in component) &&
    (typeof (component as any).inputSchema === 'object' ||
      typeof (component as any).parameters === 'object') &&
    'execute' in component &&
    typeof (component as any).execute === 'function'
  )
}

/**
 * Checks if a value is a valid ResourceDefinition.
 * Used to ensure dynamically loaded modules conform to the expected resource contract.
 */
export function validateResource(
  component: unknown
): component is ResourceDefinition {
  return (
    component !== null &&
    typeof component === 'object' &&
    'uri' in component &&
    typeof (component as any).uri === 'string' &&
    'name' in component &&
    typeof (component as any).name === 'string' &&
    'content' in component &&
    (typeof (component as any).content === 'string' ||
      typeof (component as any).content === 'function')
  )
}

/**
 * Checks if a value is a valid PromptDefinition.
 * Used to ensure dynamically loaded modules conform to the expected prompt contract.
 */
export function validatePrompt(
  component: unknown
): component is PromptDefinition {
  return (
    component !== null &&
    typeof component === 'object' &&
    'name' in component &&
    typeof (component as any).name === 'string' &&
    'getMessages' in component &&
    typeof (component as any).getMessages === 'function'
  )
}
