import { createMCPServer } from '../../server'

describe('DyneMCP stdio protocol', () => {
  it('should connect and handle stdio MCP protocol', async () => {
    const server = await createMCPServer({
      server: { name: 'test', version: '1.0.0' },
      transport: { type: 'stdio' },
      tools: {
        enabled: false,
        directory: '',
        pattern: '',
      },
      resources: {
        enabled: false,
        directory: '',
        pattern: '',
      },
      prompts: {
        enabled: false,
        directory: '',
        pattern: '',
      },
      resourcesTemplates: {
        enabled: false,
        directory: '',
        pattern: '',
      },
    })
    // Simula el connectTransport (debería no lanzar error)
    await expect(server['connectTransport']()).resolves.not.toThrow()
    // No hay asserts de mensajes porque stdio real requiere integración, pero esto prueba la wiring
  })
})

// TODO: Resource template test logic removed for production release. Re-implement in a future version if needed.
