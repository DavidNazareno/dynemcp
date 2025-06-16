import { loadConfig } from './core/config'
export declare const tools: {
  createTool: any
  tool: any
  registerTool: any
  getAllTools: any
  getTool: any
  clearTools: any
}
export declare const resources: {
  createFileResource: any
  createDynamicResource: any
  registerResource: any
  getAllResources: any
  getResource: any
  clearResources: any
}
export declare const prompt: {
  createSystemPrompt: any
  createChatPrompt: any
  createTemplatePrompt: any
  registerPrompt: any
  getAllPrompts: any
  getPrompt: any
  clearPrompts: any
  applyPromptParameters: any
}
export { loadConfig }
export declare function createMCPServer(name: string, version?: string): any
declare const _default: {
  createMCPServer: typeof createMCPServer
  loadConfig: any
  tools: {
    createTool: any
    tool: any
    registerTool: any
    getAllTools: any
    getTool: any
    clearTools: any
  }
  resources: {
    createFileResource: any
    createDynamicResource: any
    registerResource: any
    getAllResources: any
    getResource: any
    clearResources: any
  }
  prompt: {
    createSystemPrompt: any
    createChatPrompt: any
    createTemplatePrompt: any
    registerPrompt: any
    getAllPrompts: any
    getPrompt: any
    clearPrompts: any
    applyPromptParameters: any
  }
  DyneMCP: any
}
export default _default
