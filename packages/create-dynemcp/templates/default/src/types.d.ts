// Type declarations for template files
declare module '@repo/dynemcp' {
  export interface MCPServer {
    registerTools: (tools: unknown[]) => void;
    registerResources: (resources: unknown[]) => void;
    registerPrompt: (prompt: { id: string; name: string; content: string }) => void;
    start: () => Promise<void>;
  }

  export function createMCPServer(name: string, version: string): MCPServer;
}

declare module '@modelcontextprotocol/sdk' {
  export interface MCPServer {
    registerTools: (tools: unknown[]) => void;
    registerResources: (resources: unknown[]) => void;
    registerPrompt: (prompt: { id: string; name: string; content: string }) => void;
    start: () => Promise<void>;
  }
}
