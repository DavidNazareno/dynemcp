import { ResourceDefinition } from '@dynemcp/dynemcp'

const serverInfoResource: ResourceDefinition = {
  name: 'Server Information',
  uri: 'resource:server-info',
  description: 'Provides static information about this server.',
  content: 'This is a sample HTTP server running on the dynemcp framework.',
}

export default serverInfoResource
