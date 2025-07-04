// global.d.ts
// Global type declarations for DyneMCP API
// -----------------------------------------
//
// - Extends and adapts types from the MCP SDK for use in the DyneMCP workspace.
// - Ensures type compatibility and extension for all MCP-related entities.

declare module '@modelcontextprotocol/sdk' {
  export * from '@modelcontextprotocol/sdk/dist/esm/types'
  export * from '@modelcontextprotocol/sdk/dist/esm/server/mcp'
}

declare module '@modelcontextprotocol/sdk/server/mcp' {
  export * from '@modelcontextprotocol/sdk/dist/esm/server/mcp'
}

declare module '@modelcontextprotocol/sdk/types' {
  export * from '@modelcontextprotocol/sdk/dist/esm/types'
}

declare module '@modelcontextprotocol/sdk/dist/esm/types' {
  export interface Tool {
    name: string
    description: string
    parameters: Record<string, unknown>
  }

  export interface Resource {
    uri: string
    name: string
    description?: string
    content: string | (() => string | Promise<string>)
    contentType?: string
  }

  export interface Prompt {
    name: string
    description: string
    arguments?: Array<{
      name: string
      description?: string
      required?: boolean
      type?: string
      default?: string
    }>
  }

  export interface SamplingMessage {
    role: string
    content: unknown
  }

  export interface CallToolResult {
    success: boolean
    result?: unknown
    error?: string
  }

  export interface Root {
    uri: string
    name: string
  }

  export interface RootsListChangedNotification {
    roots: Root[]
  }
}
