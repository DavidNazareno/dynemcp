import { PromptDefinition } from '@dynemcp/dynemcp'

const introductionPrompt: PromptDefinition = {
  id: 'introduction',
  name: 'Introduction Prompt',
  description: 'A system prompt to introduce the model to its capabilities.',
  content: `You are a helpful assistant running on the dynemcp framework.
Use the "greet" tool to greet users and access the "server-info" resource for information.`,
}

export default introductionPrompt
