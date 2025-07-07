export default {
  server: {
    name: 'dynemcp-http-project',
    version: '1.0.0',
  },
  tools: {
    enabled: true,
    directory: './src/tools',
    pattern: '**/*.{ts,js}',
  },
  resources: {
    enabled: true,
    directory: './src/resources',
    pattern: '**/*.{ts,js}',
  },
  prompts: {
    enabled: true,
    directory: './src/prompts',
    pattern: '**/*.{ts,js}',
  },
  transport: {
    type: 'http',
    options: {
      mode: 'streamable-http',
      port: 3001,
      endpoint: '/mcp',
      oauth2Issuer: 'https://your-auth-server',
      oauth2Audience: 'https://your-mcp-server',
    },
  },
}
