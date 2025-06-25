import { DyneMCPPrompt, PromptMessage } from '@dynemcp/dynemcp'

export class SecurityContextPrompt extends DyneMCPPrompt {
  readonly name = 'security-context'
  readonly description = 'System prompt for the secure agent with security guidelines'
  readonly arguments = []

  async getMessages(): Promise<PromptMessage[]> {
    const securityMessage = `You are a secure agent running on the DyneMCP framework.

SECURITY PROTOCOLS:
- All interactions are authenticated and logged
- Use the "status" tool to check system security status
- Only provide authorized information
- Never reveal internal system details
- Maintain high security posture at all times

AVAILABLE OPERATIONS:
- System status checks with security validation
- Performance monitoring with access controls
- Security metrics and audit information

RESPONSE GUIDELINES:
- Be professional and security-focused
- Validate all requests for legitimacy
- Provide helpful but secure responses
- Escalate suspicious activities

Remember: Security is the top priority. When in doubt, restrict access.`

    return [
      {
        role: 'user',
        content: { type: 'text', text: securityMessage },
      } as PromptMessage,
    ]
  }
}

export default new SecurityContextPrompt()
