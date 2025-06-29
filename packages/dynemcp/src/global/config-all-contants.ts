/**
 * DyneMCP Package Configuration (Minimal, only used constants and helpers)
 */

// CLI Defaults
export const CLI = {
  DEFAULT_TRANSPORT: 'stdio',
  TRANSPORT_TYPES: ['stdio', 'streamable-http'],
} as const

// DYNEMCP CLI CONFIGURATION
export const DYNEMCP_CLI = {
  SCRIPT_NAME: 'dynemcp',
  USAGE: '$0 <cmd> [args]',
  DEFAULTS: {
    port: 3001,
    host: 'localhost',
    transport: CLI.DEFAULT_TRANSPORT,
    clean: false,
    analyze: false,
  },
  EXAMPLES: {
    DEV: '$0 dev',
    DEV_INSPECTOR: '$0 dev inspector',
    BUILD: '$0 build',
    BUILD_CLEAN: '$0 build --clean',
  },
  DESCRIPTIONS: {
    DEV: 'Starts the DyneMCP server in development mode',
    DEV_MODE: 'Development mode',
    BUILD: 'Build the project for production',
    INSPECTOR: 'Start development server with MCP Inspector',
  },
} as const

// DYNEMCP SERVER CONFIGURATION
export const DYNEMCP_SERVER = {
  MESSAGES: {
    STARTING: '🚀 Starting DyneMCP development server...',
    STARTING_INSPECTOR: '🔍 Starting DyneMCP with Inspector...',
    STARTING_HTTP: '🌐 Starting HTTP server...',
    STARTING_INSPECTOR_STDIO: '🔍 Launching MCP Inspector with stdio server...',
    BUILD_START: '📦 Building project...',
    BUILD_SUCCESS: '✅ Build completed',
    BUILD_FAILED: '❌ Build failed',
    SERVER_READY: '✅ Server is ready to accept connections',
    INSPECTOR_STARTING: '🔍 Starting Inspector...',
    WATCHING: '👀 Watching for changes...',
    SHUTDOWN: '🛑 Shutting down development server...',
    WAITING_SERVER: '⏳ Waiting for server to be ready...',
    HTTP_SERVER_READY: (url: string) => `✅ HTTP server ready at ${url}`,
    SERVER_RUNNING: (host: string, port: number) =>
      `🌐 Server running at http://${host}:${port}/mcp`,
  },
  ERRORS: {
    DEV_SERVER_FAILED: '❌ Failed to start development server.',
    INSPECTOR_FAILED: '❌ Inspector process error',
    SERVER_NOT_READY: (endpoint: string) =>
      `❌ Server not ready at ${endpoint}`,
    SERVER_NOT_READY_MESSAGE:
      'Make sure the server is configured correctly and the port is available',
  },
} as const

// DYNEMCP BUILD CONFIGURATION
export const DYNEMCP_BUILD = {
  MESSAGES: {
    BUILDING: '📦 Building DyneMCP project...',
    BUILD_SUCCESS: '✅ Build completed successfully!',
    BUILD_FAILED: '❌ Build failed',
  },
  OPTIONS: {
    timeout: 60000,
    watchDebounce: 300,
  },
} as const

// DYNEMCP INSPECTOR CONFIGURATION
export const DYNEMCP_INSPECTOR = {
  COMMANDS: {
    PACKAGE_MANAGER: 'pnpx',
    PACKAGE_NAME: '@modelcontextprotocol/inspector',
    STDIO_ARGS: ['node'],
    HTTP_ARGS: [],
  },
  SPAWN_OPTIONS: {
    stdio: 'inherit' as const,
    env: {
      DYNE_MCP_STDIO_LOG_SILENT: '1',
    },
  },
  TIMING: {
    SERVER_DELAY: 2000,
    READY_TIMEOUT: 10000,
  },
} as const

// Helpers realmente usados
export function getMcpEndpointUrl(
  host: string = DYNEMCP_CLI.DEFAULTS.host,
  port: number = DYNEMCP_CLI.DEFAULTS.port
): string {
  return `http://${host}:${port}/mcp`
}

export function getInspectorArgs(
  transportType: (typeof CLI.TRANSPORT_TYPES)[number],
  endpoint?: string
): string[] {
  const baseArgs = [DYNEMCP_INSPECTOR.COMMANDS.PACKAGE_NAME]
  if (transportType === 'streamable-http' && endpoint) {
    return [...baseArgs, endpoint]
  } else if (transportType === 'stdio') {
    return [
      ...baseArgs,
      ...DYNEMCP_INSPECTOR.COMMANDS.STDIO_ARGS,
      'dist/server.js',
    ]
  }
  return baseArgs
}

export function getInspectorSpawnOptions(
  transportType: (typeof CLI.TRANSPORT_TYPES)[number]
) {
  const baseOptions = { ...DYNEMCP_INSPECTOR.SPAWN_OPTIONS }
  if (transportType === 'stdio') {
    baseOptions.env = {
      ...process.env,
      ...DYNEMCP_INSPECTOR.SPAWN_OPTIONS.env,
    }
  }
  return baseOptions
}

export function setStdioLogSilent(silent: boolean): void {
  process.env['DYNE_MCP_STDIO_LOG_SILENT'] = silent ? '1' : '0'
}

export function isStdioLogSilent(): boolean {
  return process.env['DYNE_MCP_STDIO_LOG_SILENT'] === '1'
}
