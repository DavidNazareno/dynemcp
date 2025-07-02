// utils.ts
// Utility functions for the DyneMCP Main Server module
// Provides logging helpers for debug and standard output.
// ----------------------------------------------------

/**
 * logMsg: Logs a message to STDERR if DYNE_MCP_DEBUG is set, and to STDOUT if not silenced.
 */
export function logMsg(msg: string, debugLog: (msg: string) => void): void {
  debugLog(msg)
  if (!process.env.DYNE_MCP_STDIO_LOG_SILENT) {
    console.log(msg)
  }
}
