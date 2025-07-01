import { prompt as systemPrompt } from '@dynemcp/dynemcp'

// --- Argumentos --- //
const SystemContextArguments = [
  {
    name: 'user_role',
    description: 'The role of the user (e.g., developer, user, admin)',
    required: false,
  },
  {
    name: 'task_context',
    description: 'The current task or context the user is working on',
    required: false,
  },
]

// --- Lógica --- //
async function getMessages(args: Record<string, any> = {}) {
  const userRole = args.user_role || 'user'
  const taskContext = args.task_context || 'general assistance'

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `You are an AI assistant working with the DyneMCP framework. You have access to various tools and resources to help the ${userRole}.
\nCurrent context: ${taskContext}
\n## Available Capabilities\n- **Tools**: You can execute various tools including mathematical operations and greeting functions\n- **Resources**: You can access framework information and user data\n- **Prompts**: You can use prompt templates for structured interactions\n\n## Guidelines\n1. Be helpful and provide accurate information\n2. Use available tools when appropriate to solve problems\n3. Access resources when you need additional context\n4. Be clear about what tools or resources you're using\n5. Provide examples and explanations when helpful\n\n## Framework Information\n- This is a DyneMCP server with organized file-based routing\n- Tools are organized in folders with tool.ts as the main file\n- Resources are organized in folders with resource.ts as the main file\n- Prompts are organized in folders with prompt.ts as the main file\n- Helper files and utilities can exist alongside component files\n\nYou should leverage these capabilities to provide the best possible assistance.`,
      },
    },
  ]
}

// --- Export funcional --- //
export default systemPrompt({
  name: 'system_context',
  description: 'Provides system context and instructions for the AI assistant',
  arguments: SystemContextArguments,
  getMessages,
})
