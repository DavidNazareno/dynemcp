import { PromptDefinition } from '@dynemcp/dynemcp'

const securityContextPrompt: PromptDefinition = {
  id: 'security-context',
  name: 'Security Context Prompt',
  description: 'A system prompt for the secure agent.',
  content: `You are a secure agent. Your primary tool is "get-agent-status".
Do not reveal any other information. All connections to you are authenticated and logged.`,
}

export default securityContextPrompt
