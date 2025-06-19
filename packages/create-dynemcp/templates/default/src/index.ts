// Importar desde el paquete dynemcp local
import { createMCPServer } from '@repo/dynemcp';
import type { MCPServer } from '@modelcontextprotocol/sdk';
// Importar herramientas, recursos y prompt
import type { Tool } from '@modelcontextprotocol/sdk';
import type { Resource } from '@modelcontextprotocol/sdk';

// Importaciones seguras con tipos
const tools = await import('../tools/tools.js').then((m) => m.default).catch(() => [] as Tool[]);
const resources = await import('../resources/resource.js')
  .then((m) => m.default)
  .catch(() => [] as Resource[]);
const prompt = await import('../prompt/prompt.js').then((m) => m.default as string).catch(() => '');

// Inicializar el servidor MCP
const server: MCPServer = createMCPServer('dynemcp-project', '0.1.0');

// Registrar herramientas si están definidas
if (tools && tools.length > 0) {
  server.registerTools(tools);
}

// Registrar recursos si están definidos
if (resources && resources.length > 0) {
  server.registerResources(resources);
}

// Registrar prompt del sistema si está definido
if (prompt) {
  server.registerPrompt({
    id: 'system-prompt',
    name: 'System Prompt',
    content: prompt,
  });
  console.log('Prompt del sistema configurado');
}

// Modo desarrollo vs producción
if (process.env.NODE_ENV === 'development') {
  console.log('Modo desarrollo: El servidor se iniciará a través del inspector MCP');
} else {
  console.log('Iniciando servidor MCP en modo producción');
}

// Iniciar el servidor
void server.start().catch((error: Error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});

// Manejar errores
process.on('uncaughtException', (error: Error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});
