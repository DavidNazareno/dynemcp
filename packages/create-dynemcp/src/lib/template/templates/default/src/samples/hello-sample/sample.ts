import { sample, SamplingRequest, SamplingResult } from '@dynemcp/dynemcp'

// Ejemplo de función de transporte MCP (debes implementarla según tu cliente)
async function sendMcpRequest(method: string, params: any) {
  // Implementa el transporte real aquí (stdio, http, etc.)
  throw new Error('Implementa el transporte MCP aquí')
}

// Exporta un sample plug-and-play
export default {
  name: 'hello-sample',
  description: 'Solicita un completion LLM de ejemplo',
  async run(): Promise<SamplingResult> {
    const request: SamplingRequest = {
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: 'Say hello to the world!' },
        },
      ],
      maxTokens: 32,
    }
    return sample(request, sendMcpRequest)
  },
}
