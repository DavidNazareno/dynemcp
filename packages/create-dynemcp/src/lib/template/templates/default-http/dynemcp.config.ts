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
  roots: {
    enabled: true,
    directory: './src/roots',
    pattern: '**/*.{ts,js}',
  },
  transport: {
    type: 'streamable-http',
    options: {
      port: 8081,
      endpoint: '/mcp',
      oauth2Issuer: 'https://your-auth-server',
      oauth2Audience: 'https://your-mcp-server',
    },
  },
}
