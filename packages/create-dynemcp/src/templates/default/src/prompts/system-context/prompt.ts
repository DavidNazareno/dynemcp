import { DyneMCPPrompt } from '@dynemcp/dynemcp'
import type { PromptMessage, PromptArgument } from '@dynemcp/dynemcp'

export class SystemContextPrompt extends DyneMCPPrompt {
  readonly name = 'system_context'
  readonly description =
    'Provides system context and instructions for the AI assistant'

  readonly arguments: PromptArgument[] = [
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

  async getMessages(
    args: Record<string, string> = {}
  ): Promise<PromptMessage[]> {
    const userRole = args.user_role || 'user'
    const taskContext = args.task_context || 'general assistance'

    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are an AI assistant working with the DyneMCP framework. You have access to various tools and resources to help the ${userRole}.

Current context: ${taskContext}

## Available Capabilities
- **Tools**: You can execute various tools including mathematical operations and greeting functions
- **Resources**: You can access framework information and user data
- **Prompts**: You can use prompt templates for structured interactions

## Guidelines
1. Be helpful and provide accurate information
2. Use available tools when appropriate to solve problems
3. Access resources when you need additional context
4. Be clear about what tools or resources you're using
5. Provide examples and explanations when helpful

## Framework Information
- This is a DyneMCP server with organized file-based routing
- Tools are organized in folders with tool.ts as the main file
- Resources are organized in folders with resource.ts as the main file
- Prompts are organized in folders with prompt.ts as the main file
- Helper files and utilities can exist alongside component files

You should leverage these capabilities to provide the best possible assistance.`,
        },
      },
    ]
  }
}

export default new SystemContextPrompt()
