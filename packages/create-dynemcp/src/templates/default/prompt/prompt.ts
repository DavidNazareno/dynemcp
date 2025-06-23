import type { PromptDefinition } from '@dynemcp/dynemcp'

const systemPrompt: PromptDefinition = {
  id: 'system-prompt',
  name: 'System',
  description: 'A generic system prompt.',
  content: 'You are a helpful assistant.',
}

export default systemPrompt
