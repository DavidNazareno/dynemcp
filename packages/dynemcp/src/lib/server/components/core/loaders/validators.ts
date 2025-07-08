// validators.ts
// Type guards for validating dynamically loaded components in the DyneMCP framework
// Ensures that tools, resources, and prompts conform to expected contracts.

import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
} from '../../../api'
import { isRoot } from '../../../api/core/root'

/**
 * validateTool: Checks if a value is a valid ToolDefinition.
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
 * validateResource: Checks if a value is a valid ResourceDefinition.
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
 * validatePrompt: Checks if a value is a valid PromptDefinition.
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

/**
 * validateRoot: Checks if a value is a valid Root.
 * Used to ensure dynamically loaded modules conform to the expected root contract.
 */
export function validateRoot(
  component: unknown
): component is import('../../../api').Root {
  return isRoot(component)
}

/**
 * validateMiddleware: Checks if a value is a valid MiddlewareDefinition.
 * Used to ensure dynamically loaded modules conform to the expected middleware contract.
 */
export function validateMiddleware(
  component: unknown
): component is Record<string, any> {
  // You can make this stricter if you have a specific middleware shape
  return typeof component === 'object' && component !== null
}
