import { createMCPServer } from './server-dynemcp.js';
import { SERVER_VERSION } from './core/constants.js';

describe('createMCPServer', () => {
  it('should work', () => {
    expect(createMCPServer('test')).toEqual({
      server: {
        name: 'test',
        version: SERVER_VERSION,
      },
      config: {
        server: {
          name: 'test',
          version: SERVER_VERSION,
        },
        tools: {
          autoRegister: true,
        },
        resources: {
          autoRegister: true,
        },
        prompts: {
          autoRegister: true,
        },
      },
    });
  });
});
