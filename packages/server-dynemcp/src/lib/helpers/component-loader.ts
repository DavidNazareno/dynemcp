import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import type { ToolDefinition, ResourceDefinition, PromptDefinition } from '../core/interfaces.js';

export interface LoadOptions {
  enabled: boolean;
  directory: string;
  pattern?: string;
}

export interface LoadResult<T> {
  components: T[];
  errors: string[];
}

export async function loadComponentsFromDirectory<T>(
  options: LoadOptions,
  validator: (component: any) => component is T,
): Promise<LoadResult<T>> {
  const { enabled, directory, pattern = '**/*.{ts,js}' } = options;
  
  if (!enabled) {
    return { components: [], errors: [] };
  }

  const components: T[] = [];
  const errors: string[] = [];

  try {
    // Check if directory exists
    if (!fs.existsSync(directory)) {
      console.warn(`Directory ${directory} does not exist, skipping component loading`);
      return { components: [], errors: [] };
    }

    // Find all matching files
    const searchPattern = path.join(directory, pattern);
    const files = await glob(searchPattern, { absolute: true });

    // Load each file
    for (const file of files) {
      try {
        const component = await loadComponentFromFile(file, validator);
        if (component) {
          components.push(component);
        }
      } catch (error) {
        const errorMsg = `Failed to load component from ${file}: ${error}`;
        errors.push(errorMsg);
        console.warn(errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = `Failed to scan directory ${directory}: ${error}`;
    errors.push(errorMsg);
    console.warn(errorMsg);
  }

  return { components, errors };
}

async function loadComponentFromFile<T>(
  filePath: string,
  validator: (component: any) => component is T,
): Promise<T | null> {
  try {
    // Dynamic import
    const module = await import(filePath);
    
    // Check for default export
    if (module.default) {
      const component = module.default;
      if (validator(component)) {
        return component;
      }
    }

    // Check for named exports
    for (const [name, exportValue] of Object.entries(module)) {
      if (validator(exportValue)) {
        return exportValue;
      }
    }

    // Check for array exports
    if (Array.isArray(module.default)) {
      for (const item of module.default) {
        if (validator(item)) {
          return item;
        }
      }
    }

    return null;
  } catch (error) {
    throw new Error(`Import failed: ${error}`);
  }
}

export function validateTool(component: any): component is ToolDefinition {
  return (
    component &&
    typeof component === 'object' &&
    typeof component.name === 'string' &&
    typeof component.description === 'string' &&
    typeof component.schema === 'object' &&
    typeof component.handler === 'function'
  );
}

export function validateResource(component: any): component is ResourceDefinition {
  return (
    component &&
    typeof component === 'object' &&
    typeof component.uri === 'string' &&
    typeof component.name === 'string' &&
    (typeof component.content === 'string' || typeof component.content === 'function')
  );
}

export function validatePrompt(component: any): component is PromptDefinition {
  return (
    component &&
    typeof component === 'object' &&
    typeof component.id === 'string' &&
    typeof component.name === 'string' &&
    typeof component.content === 'string'
  );
} 