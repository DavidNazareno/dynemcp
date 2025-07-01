import { prompt as conversationPrompt } from '@dynemcp/dynemcp'

// --- Argumentos --- //
const ConversationArguments = [
  {
    name: 'topic',
    description: 'The topic to discuss',
    required: true,
  },
  {
    name: 'style',
    description: 'The conversation style (casual, formal, technical)',
    required: false,
  },
]

// --- Lógica --- //
async function getMessages(args: Record<string, any> = {}) {
  const topic = args.topic
  const style = args.style || 'casual'

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `You're starting a ${style} conversation about ${topic}. Engage the user with thoughtful questions and provide helpful insights. Adapt your tone to match the ${style} style requested.`,
      },
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'd love to discuss ${topic} with you! What specific aspect of ${topic} interests you most, or would you like me to share some key insights to get us started?`,
      },
    },
  ]
}

// --- Export funcional --- //
export default conversationPrompt({
  name: 'conversation_starter',
  description: 'A prompt to start a productive conversation',
  arguments: ConversationArguments,
  getMessages,
})
