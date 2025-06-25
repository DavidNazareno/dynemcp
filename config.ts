/**
 * Global DyneMCP Configuration
 *
 * This file contains all hardcoded constants, environment variables,
 * ports, paths, and other configuration values used across the DyneMCP packages.
 */

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

export const ENV_VARS = {
  /** Silences stdio logs to prevent JSON parsing errors in MCP protocol */
  STDIO_LOG_SILENT: 'DYNE_MCP_STDIO_LOG_SILENT',

  /** Development mode indicator */
  DEV_MODE: 'DYNE_MCP_DEV_MODE',

  /** Debug mode for additional logging */
  DEBUG_MODE: 'DYNE_MCP_DEBUG',
} as const

// =============================================================================
// DEFAULT PORTS AND NETWORK
// =============================================================================

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

// =============================================================================
// FILE PATHS AND DIRECTORIES
// =============================================================================

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

// =============================================================================
// CLI DEFAULTS
// =============================================================================

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

// =============================================================================
// INSPECTOR CONFIGURATION
// =============================================================================

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

// =============================================================================
// BUILD CONFIGURATION
// =============================================================================

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

// =============================================================================
// TEMPLATE CONFIGURATION
// =============================================================================

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

// =============================================================================
// LOGGING CONFIGURATION
// =============================================================================

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

// =============================================================================
// PACKAGE MANAGER CONFIGURATION
// =============================================================================

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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the full build output path
 */
export function getBuildOutputPath(): string {
  return `${PATHS.BUILD_OUTPUT_DIR}/${PATHS.BUILD_OUTPUT_FILE}`
}

/**
 * Get the full HTTP server URL
 */
export function getHttpServerUrl(
  host: string = NETWORK.DEFAULT_HTTP_HOST,
  port: number = NETWORK.DEFAULT_HTTP_PORT
): string {
  return `http://${host}:${port}`
}

/**
 * Get the full MCP endpoint URL
 */
export function getMcpEndpointUrl(
  host: string = NETWORK.DEFAULT_HTTP_HOST,
  port: number = NETWORK.DEFAULT_HTTP_PORT
): string {
  return `${getHttpServerUrl(host, port)}${NETWORK.DEFAULT_MCP_ENDPOINT}`
}

/**
 * Check if stdio logging should be silent
 */
export function isStdioLogSilent(): boolean {
  return process.env[ENV_VARS.STDIO_LOG_SILENT] === '1'
}

/**
 * Set stdio logging silent mode
 */
export function setStdioLogSilent(silent: boolean): void {
  process.env[ENV_VARS.STDIO_LOG_SILENT] = silent ? '1' : '0'
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type TransportType = (typeof CLI.TRANSPORT_TYPES)[number]
export type DevMode = (typeof CLI.DEV_MODES)[number]
export type LogLevel = (typeof CLI.LOG_LEVELS)[number]
export type TemplateName = (typeof TEMPLATES.AVAILABLE_TEMPLATES)[number]
export type PackageManager =
  | typeof PACKAGE_MANAGER.PREFERRED
  | (typeof PACKAGE_MANAGER.ALTERNATIVES)[number]
