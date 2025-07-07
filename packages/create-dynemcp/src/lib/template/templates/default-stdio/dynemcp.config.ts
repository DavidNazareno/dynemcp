export default {
  server: {
    name: 'dynemcp-stdio-project',
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
    type: 'stdio',
  },
}
