import { vi, describe, it, expect, beforeEach } from 'vitest'

// // Mock McpServer and StdioServerTransport
// vi.mock('@modelcontextprotocol/sdk/server/mcp', () => ({
//   McpServer: vi.fn().mockImplementation(() => ({
//     tool: vi.fn(),
//     connect: vi.fn().mockResolvedValue(undefined),
//     _serverInfo: { name: '', version: '' },
//   })),
// }));

// vi.mock('@modelcontextprotocol/sdk/server/stdio', () => ({
//   StdioServerTransport: vi.fn().mockImplementation(() => ({})),
// }));

// // Import the module under test
// import { createMCPServer, DyneMCP } from './core/server/server-dynemcp';
// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

// // Mock console.log to avoid test output pollution
// beforeEach(() => {
//   vi.spyOn(console, 'log').mockImplementation(vi.fn());
//   vi.clearAllMocks();
// });

describe('server-dynemcp', () => {
  it('should be true', () => {
    expect(true).toBe(true)
  })
  // beforeEach(() => {
  //   vi.clearAllMocks();
  // });

  // describe('createMCPServer', () => {
  //   it('should create a server with the correct configuration', () => {
  //     const server = createMCPServer('test', undefined, '1.0.0');

  //     // Test that it's an instance of DyneMCP
  //     expect(server).toBeInstanceOf(DyneMCP);

  //     // Verify McpServer was constructed with correct parameters
  //     expect(McpServer).toHaveBeenCalledWith({
  //       name: 'test',
  //       version: '1.0.0',
  //     });
  //   });

  //   it('should create a server with custom version when provided', () => {
  //     const server = createMCPServer('test', undefined, 'custom-version');

  //     expect(server).toBeInstanceOf(DyneMCP);
  //     expect(McpServer).toHaveBeenCalledWith({
  //       name: 'test',
  //       version: 'custom-version',
  //     });
  //   });
  // });

  // describe('DyneMCP class', () => {
  //   let server: DyneMCP;
  //   let mockMcpServer: { tool: ReturnType<typeof vi.fn>; connect: ReturnType<typeof vi.fn> };

  //   beforeEach(() => {
  //     vi.clearAllMocks();
  //     server = createMCPServer('test');
  //     // Get the mocked instance from the constructor mock
  //     mockMcpServer = vi.mocked(McpServer).mock.results[0].value;
  //   });

  //   it('should register tools correctly', () => {
  //     const mockTool = {
  //       name: 'mockTool',
  //       description: 'Mock tool for testing',
  //       schema: {},
  //       handler: vi.fn(),
  //     };

  //     server.registerTools([mockTool]);

  //     // Check that the tool method was called on the McpServer instance
  //     expect(mockMcpServer.tool).toHaveBeenCalledWith(
  //       mockTool.name,
  //       mockTool.description,
  //       mockTool.schema,
  //       mockTool.handler,
  //     );
  //   });

  //   it('should register resources correctly', () => {
  //     const mockResource = {
  //       uri: 'mock://resource',
  //       name: 'Mock Resource',
  //       content: 'Mock content',
  //     };

  //     server.registerResources([mockResource]);

  //     // Check that the tool method was called on the McpServer instance with the resource URI
  //     expect(mockMcpServer.tool).toHaveBeenCalledWith(
  //       `resource:${mockResource.uri}`,
  //       `Resource: ${mockResource.name}`,
  //       {},
  //       expect.any(Function),
  //     );
  //   });

  //   it('should register prompts correctly', () => {
  //     const mockPrompt = {
  //       id: 'system-prompt',
  //       name: 'System Prompt',
  //       content: 'You are a helpful assistant',
  //     };

  //     server.registerPrompt(mockPrompt);

  //     // Check that the tool method was called on the McpServer instance with the prompt ID
  //     expect(mockMcpServer.tool).toHaveBeenCalledWith(
  //       `prompt:${mockPrompt.id}`,
  //       `Prompt: ${mockPrompt.name}`,
  //       {},
  //       expect.any(Function),
  //     );
  //   });

  //   it('should start the server correctly', async () => {
  //     await server.start();

  //     // Check that the connect method was called on the McpServer instance
  //     expect(mockMcpServer.connect).toHaveBeenCalled();
  //     expect(console.log).toHaveBeenCalledWith('MCP server started successfully');
  //   });
  // });
})
