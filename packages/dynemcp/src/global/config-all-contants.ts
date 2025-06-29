/**
 * DyneMCP Package Configuration
 *
 * Package-specific configuration for the main dynemcp package.
 * Imports from global config and adds dynemcp-specific settings.
 */

// =============================================================================
// GLOBAL CONFIGURATION (imported from root config)
// =============================================================================

// Environment Variables
export const ENV_VARS = {
  /** Silences stdio logs to prevent JSON parsing errors in MCP protocol */
  STDIO_LOG_SILENT: 'DYNE_MCP_STDIO_LOG_SILENT',

  /** Development mode indicator */
  DEV_MODE: 'DYNE_MCP_DEV_MODE',

  /** Debug mode for additional logging */
  DEBUG_MODE: 'DYNE_MCP_DEBUG',
} as const

// Default Ports and Network
export const NETWORK = {
  /** Default HTTP server port */
  DEFAULT_HTTP_PORT: 3001,

  /** Default HTTP server host */
  DEFAULT_HTTP_HOST: 'localhost',

  /** Default MCP endpoint path */
  DEFAULT_MCP_ENDPOINT: '/mcp',

  /** Default Inspector port range start */
  INSPECTOR_PORT_START: 5173,

  /** Default Inspector host */
  INSPECTOR_HOST: 'localhost',

  /** Server readiness timeout (ms) */
  SERVER_READY_TIMEOUT: 10000,

  /** Server startup delay for stdio inspector (ms) */
  STDIO_INSPECTOR_DELAY: 2000,
} as const

// File Paths and Directories
export const PATHS = {
  /** Default config file name */
  DEFAULT_CONFIG: 'dynemcp.config.json',

  /** Default build output directory */
  BUILD_OUTPUT_DIR: 'dist',

  /** Default build output file name */
  BUILD_OUTPUT_FILE: 'server.js',

  /** Default source directory */
  SOURCE_DIR: 'src',

  /** Default tools directory */
  TOOLS_DIR: './src/tools',

  /** Default resources directory */
  RESOURCES_DIR: './src/resources',

  /** Default prompts directory */
  PROMPTS_DIR: './src/prompts',

  /** Default file patterns */
  FILE_PATTERNS: {
    TYPESCRIPT: '**/*.{ts,js}',
    CONFIG: '**/*.json',
    ALL_SOURCES: '**/*.{ts,js,json}',
  },
} as const

// CLI Defaults
export const CLI = {
  /** Default transport type */
  DEFAULT_TRANSPORT: 'stdio',

  /** Available transport types */
  TRANSPORT_TYPES: ['stdio', 'streamable-http', 'console'] as const,

  /** Available development modes */
  DEV_MODES: ['default', 'inspector'] as const,

  /** Default log level */
  DEFAULT_LOG_LEVEL: 'info',

  /** Available log levels */
  LOG_LEVELS: ['debug', 'info', 'warn', 'error'] as const,
} as const

// Inspector Configuration
export const INSPECTOR = {
  /** MCP Inspector package name */
  PACKAGE_NAME: '@modelcontextprotocol/inspector',

  /** Inspector command arguments for stdio */
  STDIO_ARGS: ['node'],

  /** Inspector command arguments for HTTP */
  HTTP_ARGS: [],

  /** Inspector process spawn options */
  SPAWN_OPTIONS: {
    stdio: 'inherit' as const,
  },
} as const

// Build Configuration
export const BUILD = {
  /** Default clean before build */
  DEFAULT_CLEAN: false,

  /** Default analyze dependencies */
  DEFAULT_ANALYZE: false,

  /** Build timeout (ms) */
  BUILD_TIMEOUT: 60000,

  /** Watch debounce time (ms) */
  WATCH_DEBOUNCE: 300,
} as const

// Logging Configuration
export const LOGGING = {
  /** Emoji and styling for different log levels */
  EMOJIS: {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    DEBUG: '🐛',
    BUILD: '📦',
    SERVER: '🚀',
    INSPECTOR: '🔍',
    NETWORK: '🌐',
    WATCH: '👀',
    SHUTDOWN: '🛑',
    LOADING: '🔄',
    SEPARATOR: '─',
  },

  /** Colors for different contexts */
  COLORS: {
    SUCCESS: 'green',
    ERROR: 'red',
    WARNING: 'yellow',
    INFO: 'blue',
    DEBUG: 'gray',
    MUTED: 'gray',
  },
} as const

// Package Manager Configuration
export const PACKAGE_MANAGER = {
  /** Preferred package manager */
  PREFERRED: 'pnpm',

  /** Alternative package managers */
  ALTERNATIVES: ['npm', 'yarn'] as const,

  /** Execute commands */
  EXEC_COMMANDS: {
    pnpm: 'pnpx',
    npm: 'npx',
    yarn: 'yarn dlx',
  },
} as const

// Template Configuration
export const TEMPLATES = {
  /** Default template name */
  DEFAULT_TEMPLATE: 'default',

  /** Available templates */
  AVAILABLE_TEMPLATES: [
    'default',
    'calculator',
    'dynamic-agent',
    'http-server',
    'secure-agent',
  ] as const,

  /** Template source directory */
  TEMPLATES_DIR: 'src/templates',

  /** Template config file name */
  TEMPLATE_CONFIG: 'dynemcp.config.json',
} as const

// Helper Functions
export function getBuildOutputPath(): string {
  return `${PATHS.BUILD_OUTPUT_DIR}/${PATHS.BUILD_OUTPUT_FILE}`
}

export function getHttpServerUrl(
  host: string = NETWORK.DEFAULT_HTTP_HOST,
  port: number = NETWORK.DEFAULT_HTTP_PORT
): string {
  return `http://${host}:${port}`
}

export function getMcpEndpointUrl(
  host: string = NETWORK.DEFAULT_HTTP_HOST,
  port: number = NETWORK.DEFAULT_HTTP_PORT
): string {
  return `${getHttpServerUrl(host, port)}${NETWORK.DEFAULT_MCP_ENDPOINT}`
}

export function isStdioLogSilent(): boolean {
  return process.env[ENV_VARS.STDIO_LOG_SILENT] === '1'
}

export function setStdioLogSilent(silent: boolean): void {
  process.env[ENV_VARS.STDIO_LOG_SILENT] = silent ? '1' : '0'
}

// Type Exports
export type TransportType = (typeof CLI.TRANSPORT_TYPES)[number]
export type DevMode = (typeof CLI.DEV_MODES)[number]
export type LogLevel = (typeof CLI.LOG_LEVELS)[number]
export type TemplateName = (typeof TEMPLATES.AVAILABLE_TEMPLATES)[number]
export type PackageManager =
  | typeof PACKAGE_MANAGER.PREFERRED
  | (typeof PACKAGE_MANAGER.ALTERNATIVES)[number]

// =============================================================================
// DYNEMCP CLI CONFIGURATION
// =============================================================================

export const DYNEMCP_CLI = {
  /** CLI script name */
  SCRIPT_NAME: 'dynemcp',

  /** CLI usage text */
  USAGE: '$0 <cmd> [args]',

  /** Default CLI options */
  DEFAULTS: {
    port: NETWORK.DEFAULT_HTTP_PORT,
    host: NETWORK.DEFAULT_HTTP_HOST,
    transport: CLI.DEFAULT_TRANSPORT,
    clean: BUILD.DEFAULT_CLEAN,
    analyze: BUILD.DEFAULT_ANALYZE,
    logLevel: CLI.DEFAULT_LOG_LEVEL,
  },

  /** CLI examples */
  EXAMPLES: {
    DEV: '$0 dev',
    DEV_INSPECTOR: '$0 dev inspector',
    BUILD: '$0 build',
    BUILD_CLEAN: '$0 build --clean',
  },

  /** CLI command descriptions */
  DESCRIPTIONS: {
    DEV: 'Starts the DyneMCP server in development mode',
    DEV_MODE: 'Development mode',
    BUILD: 'Build the project for production',
    INSPECTOR: 'Start development server with MCP Inspector',
  },
} as const

// =============================================================================
// DYNEMCP SERVER CONFIGURATION
// =============================================================================

export const DYNEMCP_SERVER = {
  /** Server startup messages */
  MESSAGES: {
    STARTING: `${LOGGING.EMOJIS.SERVER} Starting DyneMCP development server...`,
    STARTING_INSPECTOR: `${LOGGING.EMOJIS.INSPECTOR} Starting DyneMCP with Inspector...`,
    STARTING_HTTP: `${LOGGING.EMOJIS.NETWORK} Starting HTTP server...`,
    STARTING_INSPECTOR_STDIO: `${LOGGING.EMOJIS.INSPECTOR} Launching MCP Inspector with stdio server...`,
    BUILD_START: `${LOGGING.EMOJIS.BUILD} Building project...`,
    BUILD_SUCCESS: `${LOGGING.EMOJIS.SUCCESS} Build completed`,
    BUILD_FAILED: `${LOGGING.EMOJIS.ERROR} Build failed`,
    SERVER_READY: `${LOGGING.EMOJIS.SUCCESS} Server is ready to accept connections`,
    INSPECTOR_STARTING: `${LOGGING.EMOJIS.INSPECTOR} Starting Inspector...`,
    WATCHING: `${LOGGING.EMOJIS.WATCH} Watching for changes...`,
    SHUTDOWN: `${LOGGING.EMOJIS.SHUTDOWN} Shutting down development server...`,
    WAITING_SERVER: `⏳ Waiting for server to be ready...`,
    HTTP_SERVER_READY: (url: string) =>
      `${LOGGING.EMOJIS.SUCCESS} HTTP server ready at ${url}`,
    SERVER_RUNNING: (host: string, port: number) =>
      `${LOGGING.EMOJIS.NETWORK} Server running at http://${host}:${port}/mcp`,
  },

  /** Error messages */
  ERRORS: {
    DEV_SERVER_FAILED: `${LOGGING.EMOJIS.ERROR} Failed to start development server.`,
    INSPECTOR_FAILED: `${LOGGING.EMOJIS.ERROR} Inspector process error`,
    SERVER_NOT_READY: (endpoint: string) =>
      `${LOGGING.EMOJIS.ERROR} Server not ready at ${endpoint}`,
    SERVER_NOT_READY_MESSAGE:
      'Make sure the server is configured correctly and the port is available',
  },
} as const

// =============================================================================
// DYNEMCP BUILD CONFIGURATION
// =============================================================================

export const DYNEMCP_BUILD = {
  /** Build messages */
  MESSAGES: {
    BUILDING: `${LOGGING.EMOJIS.BUILD} Building DyneMCP project...`,
    BUILD_SUCCESS: `${LOGGING.EMOJIS.SUCCESS} Build completed successfully!`,
    BUILD_FAILED: `${LOGGING.EMOJIS.ERROR} Build failed`,
  },

  /** Build options */
  OPTIONS: {
    timeout: BUILD.BUILD_TIMEOUT,
    watchDebounce: BUILD.WATCH_DEBOUNCE,
  },
} as const

// =============================================================================
// DYNEMCP TRANSPORT CONFIGURATION
// =============================================================================

export const DYNEMCP_TRANSPORT = {
  /** Transport detection messages */
  DEBUG_MESSAGES: {
    TRANSPORT_DETECTION: `${LOGGING.EMOJIS.DEBUG} Debug: Transport detection:`,
    CONFIG_PATH: (path: string) => `  - Config path: ${path}`,
    CONFIG_TRANSPORT: (transport: string) =>
      `  - Config transport: ${transport}`,
    CLI_TRANSPORT: (transport: string) => `  - CLI transport: ${transport}`,
    EFFECTIVE_TRANSPORT: (transport: string) =>
      `  - Effective transport: ${transport}`,
    PORT_HOST: (port: number, host: string) =>
      `  - Port: ${port}, Host: ${host}`,
    LAUNCH_INSPECTOR: (transport: string) =>
      `${LOGGING.EMOJIS.DEBUG} Debug: launchInspector called with transport: ${transport}`,
  },

  /** Default config paths */
  CONFIG_PATHS: {
    PRIMARY: PATHS.DEFAULT_CONFIG,
    FALLBACK: 'dynemcp.config.json',
  },
} as const

// =============================================================================
// DYNEMCP INSPECTOR CONFIGURATION
// =============================================================================

export const DYNEMCP_INSPECTOR = {
  /** Inspector command configuration */
  COMMANDS: {
    PACKAGE_MANAGER: PACKAGE_MANAGER.EXEC_COMMANDS[PACKAGE_MANAGER.PREFERRED],
    PACKAGE_NAME: INSPECTOR.PACKAGE_NAME,
    STDIO_ARGS: INSPECTOR.STDIO_ARGS,
    HTTP_ARGS: INSPECTOR.HTTP_ARGS,
  },

  /** Inspector spawn options */
  SPAWN_OPTIONS: {
    stdio: INSPECTOR.SPAWN_OPTIONS.stdio,
    env: {
      // Environment variables for Inspector subprocess
      [ENV_VARS.STDIO_LOG_SILENT]: '1', // Critical: silence logs for stdio
    },
  },

  /** Inspector timing */
  TIMING: {
    SERVER_DELAY: NETWORK.STDIO_INSPECTOR_DELAY,
    READY_TIMEOUT: NETWORK.SERVER_READY_TIMEOUT,
  },
} as const

// =============================================================================
// DYNEMCP HELPER FUNCTIONS
// =============================================================================

/**
 * Get the effective transport configuration
 */
export function getEffectiveTransportConfig(
  cliTransport?: string,
  configTransport?: string,
  port?: number,
  host?: string
) {
  return {
    transport: cliTransport || configTransport || CLI.DEFAULT_TRANSPORT,
    port: port || NETWORK.DEFAULT_HTTP_PORT,
    host: host || NETWORK.DEFAULT_HTTP_HOST,
  }
}

/**
 * Get Inspector command arguments for a transport type
 */
export function getInspectorArgs(
  transportType: TransportType,
  endpoint?: string
): string[] {
  const baseArgs = [DYNEMCP_INSPECTOR.COMMANDS.PACKAGE_NAME]

  if (transportType === 'streamable-http' && endpoint) {
    return [...baseArgs, endpoint]
  } else if (transportType === 'stdio') {
    return [
      ...baseArgs,
      ...DYNEMCP_INSPECTOR.COMMANDS.STDIO_ARGS,
      getBuildOutputPath(),
    ]
  }

  return baseArgs
}

/**
 * Get spawn options for Inspector process
 */
export function getInspectorSpawnOptions(transportType: TransportType) {
  const baseOptions = { ...DYNEMCP_INSPECTOR.SPAWN_OPTIONS }

  if (transportType === 'stdio') {
    baseOptions.env = {
      ...process.env,
      ...DYNEMCP_INSPECTOR.SPAWN_OPTIONS.env,
    }
  }

  return baseOptions
}

/**
 * Create debug transport detection message
 */
export function createTransportDebugMessage(
  configPath: string,
  configTransport?: string,
  cliTransport?: string,
  effectiveTransport?: string,
  port?: number,
  host?: string
): string[] {
  return [
    DYNEMCP_TRANSPORT.DEBUG_MESSAGES.TRANSPORT_DETECTION,
    DYNEMCP_TRANSPORT.DEBUG_MESSAGES.CONFIG_PATH(configPath),
    DYNEMCP_TRANSPORT.DEBUG_MESSAGES.CONFIG_TRANSPORT(
      configTransport || 'undefined'
    ),
    DYNEMCP_TRANSPORT.DEBUG_MESSAGES.CLI_TRANSPORT(cliTransport || 'undefined'),
    DYNEMCP_TRANSPORT.DEBUG_MESSAGES.EFFECTIVE_TRANSPORT(
      effectiveTransport || 'undefined'
    ),
    DYNEMCP_TRANSPORT.DEBUG_MESSAGES.PORT_HOST(port || 0, host || 'undefined'),
  ]
}

// Note: All global configuration is now defined above and exported directly
