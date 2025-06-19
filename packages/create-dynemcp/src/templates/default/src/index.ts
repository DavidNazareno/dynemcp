import tools from '../tools/tools.js';
import resources from '../resources/resource.js';
import prompt from '../prompt/prompt.js';
import { createMCPServer } from '@dynemcp/server-dynemcp';

const server = createMCPServer('dynemcp-project', '0.1.0');

if (tools && tools.length > 0) {
  server.registerTools(tools);
}

if (resources && resources.length > 0) {
  server.registerResources(resources);
}

if (prompt) {
  server.registerPrompt({
    id: 'system-prompt',
    name: 'System Prompt',
    content: prompt,
  });
  console.log('Prompt del sistema configurado');
}

if (process.env.NODE_ENV === 'development') {
  console.log('Modo desarrollo: El servidor se iniciará a través del inspector MCP');
} else {
  console.log('Iniciando servidor MCP en modo producción');
}

void server.start().catch((error: Error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});
