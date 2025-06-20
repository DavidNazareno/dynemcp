import { createMCPServer } from '@dynemcp/server-dynemcp';

// Create MCP server instance
const server = createMCPServer();

async function main() {
  try {
    console.log('🚀 Starting Calculator MCP server...');
    await server.start();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await server.stop();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
}); 