import {
  loadComponentsFromDirectory,
  validateTool,
  validateResource,
  validatePrompt,
} from '../../helpers/component-loader.js';
import type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  AutoloadConfig,
} from '../interfaces.js';

export interface LoadAllOptions {
  tools: AutoloadConfig;
  resources: AutoloadConfig;
  prompts: AutoloadConfig;
}

export interface LoadAllResult {
  tools: ToolDefinition[];
  resources: ResourceDefinition[];
  prompts: PromptDefinition[];
  errors: string[];
}

export async function loadAllComponents(options: LoadAllOptions): Promise<LoadAllResult> {
  const errors: string[] = [];

  // Load tools
  const toolsResult = await loadComponentsFromDirectory(options.tools, validateTool);
  errors.push(...toolsResult.errors);

  // Load resources
  const resourcesResult = await loadComponentsFromDirectory(options.resources, validateResource);
  errors.push(...resourcesResult.errors);

  // Load prompts
  const promptsResult = await loadComponentsFromDirectory(options.prompts, validatePrompt);
  errors.push(...promptsResult.errors);

  return {
    tools: toolsResult.components,
    resources: resourcesResult.components,
    prompts: promptsResult.components,
    errors,
  };
}
