import { resource } from '@dynemcp/dynemcp'

// --- Logic --- //
// Returns a JSON string with user preferences, session data, and capabilities
function getUserData() {
  return JSON.stringify(
    {
      userPreferences: {
        theme: 'auto', // User's theme preference
        language: 'en', // User's language preference
        notifications: true, // Whether notifications are enabled
      },
      sessionData: {
        startTime: new Date().toISOString(), // Session start time
        framework: 'DyneMCP', // Framework name
        version: '1.0.0', // Framework version
      },
      capabilities: [
        'tool-execution', // Can execute tools
        'resource-access', // Can access resources
        'prompt-templates', // Can use prompt templates
      ],
    },
    null,
    2
  )
}

// --- Export --- //
// This resource provides user data and preferences in JSON format
export default resource({
  uri: 'resource://user-data',
  name: 'user-data',
  description: 'User data and preferences',
  mimeType: 'application/json',
  getContent: getUserData,
})
