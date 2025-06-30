import { resource } from '@dynemcp/dynemcp'

export default resource({
  uri: 'resource://user-data',
  name: 'user-data',
  description: 'User data and preferences',
  mimeType: 'application/json',
  getContent: () =>
    JSON.stringify(
      {
        userPreferences: {
          theme: 'auto',
          language: 'en',
          notifications: true,
        },
        sessionData: {
          startTime: new Date().toISOString(),
          framework: 'DyneMCP',
          version: '1.0.0',
        },
        capabilities: ['tool-execution', 'resource-access', 'prompt-templates'],
      },
      null,
      2
    ),
})
