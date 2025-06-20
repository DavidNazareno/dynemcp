import { DyneMCPResource } from '@dynemcp/server-dynemcp'

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
  uri = 'https://example.com/docs'
  name = 'Example Documentation'
  description = 'Example documentation resource'

  async getContent(): Promise<string> {
    return `# Example Documentation

This is an example resource that provides documentation.

## Usage

This resource demonstrates how to create resources in DyneMCP.

## Features

- Type-safe resource definitions
- Async content loading
- Rich text support

## Example

\`\`\`typescript
import { DyneMCPResource } from '@dynemcp/server-dynemcp';

export class MyResource extends DyneMCPResource {
  uri = 'https://myapp.com/docs';
  name = 'My Documentation';
  description = 'My documentation resource';

  async getContent(): Promise<string> {
    return '# My Documentation\\n\\nThis is my documentation.';
  }
}
\`\`\``
  }
}

export default new ExampleResource()
