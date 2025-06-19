/**
 * Prompt registry for DyneMCP framework
 */

import { PromptDefinition } from '../core/dynemcp/interfaces.ts'

// Collection of registered prompts
const promptRegistry: Map<string, PromptDefinition> = new Map()

/**
 * Register a prompt in the registry
 *
 * @param prompt - The prompt to register
 */
export function registerPrompt(prompt: PromptDefinition): void {
  if (promptRegistry.has(prompt.id)) {
    console.warn(
      `Prompt '${prompt.id}' is already registered. It will be overwritten.`
    )
  }

  promptRegistry.set(prompt.id, prompt)
}

/**
 * Get all registered prompts
 *
 * @returns Array of registered prompts
 */
export function getAllPrompts(): PromptDefinition[] {
  return Array.from(promptRegistry.values())
}

/**
 * Get a specific prompt by ID
 *
 * @param id - The ID of the prompt to get
 * @returns The prompt or undefined if not found
 */
export function getPrompt(id: string): PromptDefinition | undefined {
  return promptRegistry.get(id)
}

/**
 * Clear all registered prompts
 */
export function clearPrompts(): void {
  promptRegistry.clear()
}

/**
 * Create a system prompt
 *
 * @param id - The ID of the prompt
 * @param name - The name of the prompt
 * @param content - The system message content
 * @param options - Additional prompt options
 * @returns The created prompt
 */
export function createSystemPrompt(
  id: string,
  name: string,
  content: string,
  options: {
    description?: string
  } = {}
): PromptDefinition {
  const prompt: PromptDefinition = {
    id,
    name,
    content,
    description: options.description || name,
  }

  // Register the prompt
  registerPrompt(prompt)

  return prompt
}

/**
 * Create a chat prompt
 *
 * @param id - The ID of the prompt
 * @param name - The name of the prompt
 * @param messages - The chat messages
 * @param options - Additional prompt options
 * @returns The created prompt
 */
export function createChatPrompt(
  id: string,
  name: string,
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>,
  options: {
    description?: string
  } = {}
): PromptDefinition {
  // Convert messages to a single string
  const content = messages
    .map(message => `${message.role}: ${message.content}`)
    .join('\n\n')

  const prompt: PromptDefinition = {
    id,
    name,
    content,
    description: options.description || name,
  }

  // Register the prompt
  registerPrompt(prompt)

  return prompt
}

/**
 * Create a template prompt with parameter substitution
 *
 * @param id - The ID of the prompt
 * @param name - The name of the prompt
 * @param template - The template string
 * @param options - Additional prompt options
 * @returns The created prompt
 */
export function createTemplatePrompt(
  id: string,
  name: string,
  template: string,
  options: {
    description?: string
  } = {}
): PromptDefinition {
  const prompt: PromptDefinition = {
    id,
    name,
    content: template,
    description: options.description || name,
  }

  // Register the prompt
  registerPrompt(prompt)

  return prompt
}

/**
 * Apply parameters to a template prompt
 *
 * @param promptId - The ID of the prompt to apply parameters to
 * @param params - The parameters to apply
 * @returns The prompt with parameters applied
 */
export function applyPromptParameters(
  promptId: string,
  params: Record<string, any>
): PromptDefinition {
  const prompt = getPrompt(promptId)

  if (!prompt) {
    throw new Error(`Prompt not found: ${promptId}`)
  }

  // Create a deep copy of the prompt
  const appliedPrompt: PromptDefinition = JSON.parse(JSON.stringify(prompt))

  // Apply parameters to the content
  let content = appliedPrompt.content

  // Replace parameters in the content
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `{{${key}}}`
    content = content.replace(new RegExp(placeholder, 'g'), String(value))
  }

  appliedPrompt.content = content

  return appliedPrompt
}
