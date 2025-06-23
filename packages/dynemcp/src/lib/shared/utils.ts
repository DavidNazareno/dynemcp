/**
 * Shared utilities for DyneMCP framework
 */

import chalk from 'chalk'

/**
 * Log utility functions
 */
export const log = {
  info: (message: string) => {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
      console.log(chalk.blue(`ℹ️  ${message}`))
  },
  success: (message: string) => {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
      console.log(chalk.green(`✅ ${message}`))
  },
  warning: (message: string) => {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
      console.log(chalk.yellow(`⚠️  ${message}`))
  },
  error: (message: string) => {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
      console.error(chalk.red(`❌ ${message}`))
  },
  debug: (message: string) => {
    if (!process.env.DYNE_MCP_STDIO_LOG_SILENT)
      console.log(chalk.gray(`🔍 ${message}`))
  },
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}m`
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
