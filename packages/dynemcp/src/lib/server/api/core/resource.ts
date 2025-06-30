// resource.ts
// API funcional para DyneMCP Resources
// -------------------------------------

import type { ResourceDefinition } from './interfaces'

/**
 * Nueva API funcional para definir recursos (resources) de DyneMCP.
 * Permite una sintaxis simple y flexible:
 *
 * export default resource({ uri, name, description, mimeType, getContent })
 */
export function resource(config: {
  uri: string
  name: string
  description?: string
  mimeType?: string
  getContent: () => string | Promise<string>
}): ResourceDefinition {
  return {
    uri: config.uri,
    name: config.name,
    description: config.description,
    mimeType: config.mimeType,
    content: config.getContent,
    contentType: config.mimeType || 'application/octet-stream',
  }
}
