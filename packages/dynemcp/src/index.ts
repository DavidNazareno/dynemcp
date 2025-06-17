import { createFileResource } from './resources/registry'
import { createTool } from './tools/registry'
import { tool } from './tools/registry'
import { registerTool } from './tools/registry'
import { getAllTools } from './tools/registry'
import { getTool } from './tools/registry'
import { clearTools } from './tools/registry'
import { createDynamicResource } from './resources/registry'
import { registerResource } from './resources/registry'
import { getAllResources } from './resources/registry'
import { getResource } from './resources/registry'
import { clearResources } from './resources/registry'
import { createSystemPrompt } from './prompt/registry'
import { createChatPrompt } from './prompt/registry'
import { createTemplatePrompt } from './prompt/registry'
import { registerPrompt } from './prompt/registry'
import { getAllPrompts } from './prompt/registry'
import { getPrompt } from './prompt/registry'
import { clearPrompts } from './prompt/registry'
import { applyPromptParameters } from './prompt/registry'
import { loadConfig } from './core/config'
import { DyneMCP } from './core/dynemcp/dynemcp'


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
