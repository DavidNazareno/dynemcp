import { loadConfig } from './lib/core/config.js';
import {
  createSystemPrompt,
  createChatPrompt,
  createTemplatePrompt,
  registerPrompt,
  getAllPrompts,
  getPrompt,
  clearPrompts,
  applyPromptParameters,
} from './lib/prompt/registry.js';
import {
  createFileResource,
  createDynamicResource,
  registerResource,
  getAllResources,
  getResource,
  clearResources,
} from './lib/resources/registry.js';
import { DyneMCP } from './lib/server-dynemcp.js';
import {
  createTool,
  tool,
  registerTool,
  getAllTools,
  getTool,
  clearTools,
} from './lib/tools/registry.js';
import { SERVER_VERSION } from './lib/core/constants.js';

// Export namespaces for better organization
export const tools = {
  createTool,
  tool,
  registerTool,
  getAllTools,
  getTool,
  clearTools,
};

export const resources = {
  createFileResource,
  createDynamicResource,
  registerResource,
  getAllResources,
  getResource,
  clearResources,
};

export const prompt = {
  createSystemPrompt,
  createChatPrompt,
  createTemplatePrompt,
  registerPrompt,
  getAllPrompts,
  getPrompt,
  clearPrompts,
  applyPromptParameters,
};

// Export the type definitions for external use
export type {
  ResourceDefinition,
  ToolDefinition,
  PromptDefinition,
} from './lib/core/interfaces.js';

export { loadConfig };

export function createMCPServer(name: string, version?: string) {
  return new DyneMCP(name, version || SERVER_VERSION);
}

export default {
  createMCPServer,
  loadConfig,
  tools,
  resources,
  prompt,
  DyneMCP,
};
