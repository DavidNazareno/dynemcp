import type { ResourceDefinition } from '@dynemcp/dynemcp'

// Define your resources here
// Example:
// const myResource: Resource = {
//   name: 'myResource',
//   description: 'A resource that provides data',
//   generator: async () => {
//     return 'Some resource content'
//   }
// }

const exampleResource: ResourceDefinition = {
  name: 'example_resource',
  uri: 'dynemcp://resource/example',
  description: 'An example resource file.',
  contentType: 'text/plain',
  content: async () => 'This is the content of the example resource.',
}

export default exampleResource
