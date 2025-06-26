import { DyneMCPResource } from '@dynemcp/dynemcp'

export class UserDataResource extends DyneMCPResource {
  readonly uri = 'resource://user-data'
  readonly name = 'user-data'
  readonly description = 'User data and preferences'
  readonly mimeType = 'application/json'

  getContent(): string {
    return JSON.stringify(
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
    )
  }
}

export default new UserDataResource()
