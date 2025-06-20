// Main server classes and functions
export { DyneMCP, createMCPServer } from './lib/core/server/server-dynemcp.js';

// Configuration and registry
export { loadConfig } from './lib/core/config.js';
export { registry } from './lib/core/registry/registry.js';

// Base classes for inheritance
export { DyneMCPTool, DyneMCPResource, DyneMCPPrompt } from './lib/core/base.js';

// Type utilities
export type { ToolInput, InferSchema } from './lib/core/base.js';

// Validation utilities
export { validateToolSchema, validateAllTools, defineSchema } from './lib/core/validation.js';

// Transport utilities
export { createTransport } from './lib/transport/index.js';

// Helper functions for creating components
export * as helpers from './lib/helpers/index.js';

// Schemas
export * as schemas from './lib/schemas/index.js';

// Types
export type {
  ToolDefinition,
  ResourceDefinition,
  PromptDefinition,
  DyneMCPConfig,
  AutoloadConfig,
  LoggingConfig,
  DebugConfig,
  PerformanceConfig,
  SecurityConfig,
  TransportConfig,
  StdioTransportConfig,
  SSETransportConfig,
  HTTPStreamTransportConfig,
} from './lib/core/interfaces.js';
