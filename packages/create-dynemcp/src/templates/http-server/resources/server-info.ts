import { DyneMCPResource } from '@dynemcp/dynemcp'

export class ServerInfoResource extends DyneMCPResource {
  readonly uri = 'resource://http-server/info'
  readonly name = 'server-info'
  readonly description =
    'Comprehensive information about this HTTP server instance'
  readonly mimeType = 'text/plain'

  getContent(): string {
    return `# HTTP Server Information

## Server Details
- Framework: DyneMCP (Model Context Protocol)
- Type: HTTP Server Template
- Status: Active
- Created: ${new Date().toISOString()}

## Available Features
- Greeting tool with multiple styles
- Server information resource
- Introduction prompt for context

## Usage
This server demonstrates basic MCP capabilities including:
- Tool execution (greet)
- Resource access (server-info)
- Prompt management (introduction)

## Security
- All connections are logged
- Input validation enabled
- Error handling implemented`
  }
}

export default new ServerInfoResource()
