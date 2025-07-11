export default {
  server: {
    name: 'dynemcp-stdio-project',
    version: '1.0.0',
  },
  tools: {
    enabled: true,
    directory: './src/tools',
    pattern: '**/*.ts',
  },
  resources: {
    enabled: true,
    directory: './src/resources',
    pattern: '**/*.ts',
  },
  prompts: {
    enabled: true,
    directory: './src/prompts',
    pattern: '**/*.ts',
  },
  transport: {
    type: 'stdio',
  },
}
