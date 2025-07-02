// sampling.ts
// Functional API for Sampling (LLM completions) in DyneMCP
// --------------------------------------------------------
//
// - Provides a simple API for requesting LLM completions via MCP sampling/createMessage.
// - Uses the current DyneMCP instance to send requests and receive results.

import type { SamplingRequest, SamplingResult } from './interfaces'
import { getCurrentDyneMCPInstance } from '../../main/core/server-instance'

/**
 * Requests an LLM completion via MCP sampling/createMessage.
 * The user must provide a transport function that sends the MCP request and returns the response.
 *
 * @param request SamplingRequest object (messages, preferences, etc.)
 * @returns SamplingResult (LLM completion result)
 */
export async function sample(
  request: SamplingRequest
): Promise<SamplingResult> {
  const mcp = getCurrentDyneMCPInstance()
  if (!mcp) throw new Error('No DyneMCP instance available')
  return await mcp.sample(request)
}
