import { sample, SamplingRequest, SamplingResult } from '@dynemcp/dynemcp'

// --- Logic --- //
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
  // Solo necesitas llamar a sample(request), el framework se encarga del resto
  return await sample(request)
}

// --- Export --- //
// This sample demonstrates how to request an LLM completion using DyneMCP
export default {
  name: 'hello-sample',
  description: 'Requests a sample LLM completion',
  run: runHelloSample,
}
