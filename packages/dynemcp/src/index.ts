import { createFileResource } from './resources/registry.ts'
import { createTool } from './tools/registry.ts'
import { tool } from './tools/registry.ts'
import { registerTool } from './tools/registry.ts'
import { getAllTools } from './tools/registry.ts'
import { getTool } from './tools/registry.ts'
import { clearTools } from './tools/registry.ts'
import { createDynamicResource } from './resources/registry.ts'
import { registerResource } from './resources/registry.ts'
import { getAllResources } from './resources/registry.ts'
import { getResource } from './resources/registry.ts'
import { clearResources } from './resources/registry.ts'
import { createSystemPrompt } from './prompt/registry.ts'
import { createChatPrompt } from './prompt/registry.ts'
import { createTemplatePrompt } from './prompt/registry.ts'
import { registerPrompt } from './prompt/registry.ts'
import { getAllPrompts } from './prompt/registry.ts'
import { getPrompt } from './prompt/registry.ts'
import { clearPrompts } from './prompt/registry.ts'
import { applyPromptParameters } from './prompt/registry.ts'
import { loadConfig } from './core/config.ts'
import { DyneMCP } from './core/dynemcp/dynemcp.ts'

// Export namespaces for better organization
export const tools = {
  createTool,
  tool,
  registerTool,
  getAllTools,
  getTool,
  clearTools,
}

export const resources = {
  createFileResource,
  createDynamicResource,
  registerResource,
  getAllResources,
  getResource,
  clearResources,
}

export const prompt = {
  createSystemPrompt,
  createChatPrompt,
  createTemplatePrompt,
  registerPrompt,
  getAllPrompts,
  getPrompt,
  clearPrompts,
  applyPromptParameters,
}

export { loadConfig }

export function createMCPServer(name: string, version?: string) {
  return new DyneMCP(name, version || '1.0.0')
}

export default {
  createMCPServer,
  loadConfig,
  tools,
  resources,
  prompt,
  DyneMCP,
}
