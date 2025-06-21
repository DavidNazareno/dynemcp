import { DyneMCPResource } from '@dynemcp/dynemcp'

// Define your resources here
// Example:
// const myResource: Resource = {
//   name: 'myResource',
//   description: 'A resource that provides data',
//   generator: async () => {
//     return 'Some resource content'
//   }
// }

export class ExampleResource extends DyneMCPResource {
  readonly name = 'example_resource'
  readonly uri = 'dynemcp://resource/example'
  readonly description = 'An example resource file.'
  readonly contentType = 'text/plain'

  getContent(): string {
    return 'This is the content of the example resource.'
  }
}

export default new ExampleResource()
