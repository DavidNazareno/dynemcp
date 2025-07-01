import { sample, SamplingRequest, SamplingResult } from '@dynemcp/dynemcp'

// --- Logic --- //
// Example MCP transport function (you must implement this for your client)
async function sendMcpRequest(method: string, params: any) {
  // Implement the actual transport here (stdio, http, etc.)
  throw new Error('Implement MCP transport here')
}

// Runs a sample LLM completion using the DyneMCP framework
async function runHelloSample(): Promise<SamplingResult> {
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
}

// --- Export --- //
// This sample demonstrates how to request an LLM completion using DyneMCP
export default {
  name: 'hello-sample',
  description: 'Requests a sample LLM completion',
  run: runHelloSample,
}
