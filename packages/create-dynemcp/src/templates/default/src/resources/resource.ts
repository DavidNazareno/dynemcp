import type { ResourceDefinition } from '@dynemcp/dynemcp'

// Define your resources here
// Example:
// const myResource: ResourceDefinition = {
//   name: 'myResource',
//   uri: 'myapp://resource/my-resource',
//   description: 'A resource that provides data',
//   content: async () => {
//     return 'Some resource content'
//   }
// }

const exampleResource: ResourceDefinition = {
  name: 'example_resource',
  uri: 'dynemcp://resource/example',
  description: 'An example resource file.',
  mimeType: 'text/plain',
  content: async () => 'This is the content of the example resource.',
}

export default exampleResource
