// resource.ts
// Base class for DyneMCP Resources
// --------------------------------

import type { ResourceDefinition } from './interfaces'

/**
 * Base class for all MCP Resources
 */
export abstract class DyneMCPResource implements ResourceDefinition {
  [key: string]: unknown

  abstract readonly uri: string
  abstract readonly name: string
  abstract readonly description?: string
  abstract readonly mimeType?: string

  /**
   * Get the resource content
   */
  abstract getContent(): string | Promise<string>

  /**
   * Required by ResourceDefinition interface
   */
  get content(): string | (() => string | Promise<string>) {
    return this.getContent.bind(this)
  }

  /**
   * Required by ResourceDefinition interface
   */
  get contentType(): string | undefined {
    return this.mimeType
  }

  /**
   * Convert the resource to Resource format
   */
  toDefinition(): ResourceDefinition {
    return {
      uri: this.uri,
      name: this.name,
      content: this.getContent.bind(this),
      description: this.description,
      mimeType: this.mimeType,
      contentType: this.mimeType || 'application/octet-stream',
    }
  }
}
