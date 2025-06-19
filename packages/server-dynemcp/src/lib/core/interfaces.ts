import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: Record<string, z.ZodType>;
  handler: (params: any) => Promise<any> | any;
}

export interface ResourceDefinition {
  uri: string;
  name: string;
  content: string | (() => string | Promise<string>);
  description?: string;
  contentType?: string;
}

export interface PromptDefinition {
  id: string;
  name: string;
  content: string;
  description?: string;
}
