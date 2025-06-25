import { ResourceDefinition } from '@dynemcp/dynemcp'

const serverInfoResource: ResourceDefinition = {
  name: 'server-info',
  uri: 'resource:server-info',
  description: 'Provides static information about this server.',
  mimeType: 'text/plain',
  content: 'This is a sample HTTP server running on the dynemcp framework.',
}

export default serverInfoResource
