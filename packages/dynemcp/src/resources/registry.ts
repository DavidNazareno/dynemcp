/**
 * Resource registry for DyneMCP framework
 */

import fs from 'fs'
import path from 'path'
import { ResourceDefinition } from '../core/dynemcp'

// Collection of registered resources
const resourceRegistry: Map<string, ResourceDefinition> = new Map()

/**
 * Register a resource in the registry
 *
 * @param resource - The resource to register
 */
export function registerResource(resource: ResourceDefinition): void {
  if (resourceRegistry.has(resource.uri)) {
    console.warn(
      `Resource '${resource.uri}' is already registered. It will be overwritten.`
    )
  }

  resourceRegistry.set(resource.uri, resource)
}

/**
 * Get all registered resources
 *
 * @returns Array of registered resources
 */
export function getAllResources(): ResourceDefinition[] {
  return Array.from(resourceRegistry.values())
}

/**
 * Get a specific resource by URI
 *
 * @param uri - The URI of the resource to get
 * @returns The resource or undefined if not found
 */
export function getResource(uri: string): ResourceDefinition | undefined {
  return resourceRegistry.get(uri)
}

/**
 * Clear all registered resources
 */
export function clearResources(): void {
  resourceRegistry.clear()
}

/**
 * Create a static resource from a file
 *
 * @param filePath - Path to the file
 * @param options - Additional resource options
 * @returns The created resource
 */
export function createFileResource(
  filePath: string,
  options: {
    name?: string
    description?: string
    uri?: string
    contentType?: string
  } = {}
): ResourceDefinition {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`)
  }

  const fileName = path.basename(absolutePath)
  const fileContent = fs.readFileSync(absolutePath, 'utf-8')

  const resource: ResourceDefinition = {
    uri: options.uri || `file://${absolutePath}`,
    name: options.name || fileName,
    content: fileContent,
    description: options.description,
    contentType: options.contentType || getContentType(fileName),
  }

  // Register the resource
  registerResource(resource)

  return resource
}

/**
 * Create a dynamic resource from a function
 *
 * @param uri - The URI of the resource
 * @param name - The name of the resource
 * @param generator - Function that generates the resource content
 * @param options - Additional resource options
 * @returns The created resource
 */
export function createDynamicResource(
  uri: string,
  name: string,
  generator: () => string | Promise<string>,
  options: {
    description?: string
    contentType?: string
  } = {}
): ResourceDefinition {
  const resource: ResourceDefinition = {
    uri,
    name,
    content: generator,
    description: options.description,
    contentType: options.contentType || 'application/octet-stream',
  }

  // Register the resource
  registerResource(resource)

  return resource
}

/**
 * Get the content type based on file extension
 *
 * @param fileName - The file name
 * @returns The content type
 */
function getContentType(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase()

  const contentTypes: Record<string, string> = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.md': 'text/markdown',
    '.xml': 'application/xml',
    '.csv': 'text/csv',
    '.yaml': 'application/yaml',
    '.yml': 'application/yaml',
  }

  return contentTypes[extension] || 'application/octet-stream'
}
