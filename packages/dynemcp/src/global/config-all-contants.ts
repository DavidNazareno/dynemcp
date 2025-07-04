/**
 * DyneMCP Package Configuration
 *
 * Package-specific configuration for the main dynemcp package.
 * Imports from global config and adds dynemcp-specific settings.
 */

// =============================================================================
// GLOBAL CONFIGURATION (imported from root config)
// =============================================================================

// File Paths and Directories
export const PATHS = {
  /** Default config file name */
  DEFAULT_CONFIG: 'dynemcp.config.ts',

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

  /** Default roots directory */
  ROOTS_DIR: './src/roots',

  /** Default file patterns */
  FILE_PATTERNS: {
    TYPESCRIPT: '**/*.{ts,js}',
    CONFIG: '**/*.json',
    ALL_SOURCES: '**/*.{ts,js,json}',
  },
}

export const TRANSPORT = {
  DEFAULT_TRANSPORT: 'stdio',
  TRANSPORT_TYPES: {
    STDIO: 'stdio',
    STREAMABLE_HTTP: 'streamable-http',
  },

  DEFAULT_TRANSPORT_HTTP_OPTIONS: {
    port: 3001,
    endpoint: '/mcp',
    host: 'localhost',
    oauth2Issuer: 'https://your-auth-server',
    oauth2Audience: 'https://your-mcp-server',
  },
}

/* // Inspector Configuration
export const INSPECTOR = {
  /** MCP Inspector package name *
  PACKAGE_NAME: '@modelcontextprotocol/inspector',

  /** Inspector command arguments for stdio *
  STDIO_ARGS: ['node'],

  /** Inspector command arguments for HTTP *
  HTTP_ARGS: [],

  /** Inspector process spawn options *
  SPAWN_OPTIONS: {
    stdio: 'inherit' ,
  },
} 
 */
// Build Configuration
export const BUILD = {
  /** Default clean before build */
  DEFAULT_CLEAN: false,

  /** Default analyze dependencies */
  DEFAULT_ANALYZE: false,

  /** Build timeout (ms) */
  TIMEOUT: 60000,

  /** Watch debounce time (ms) */
  WATCH_DEBOUNCE: 300,

  /** Build target */
  TARGET: 'node20',

  /** Build format */
  FORMAT: 'esm',

  /** Build platform */
  PLATFORM: 'node',

  /** Build entry point */
  ENTRY_POINT: 'src/index.ts',

  /** Build bundle */
  BUNDLE: true,

  /** Build write */
  WRITE: false,

  /** Build metafile */
  METAFILE: true,

  ENVIRONMENT: {
    PROD: 'production',
    DEV: 'development',
    TEST: 'test',
  },
}

// Logging Configuration
export const LOGGING = {
  DEFAULT_LOG_LEVEL: 'info',

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
}

// Package Manager Configuration
export const PACKAGE_MANAGER = {
  /** Preferred package manager */
  PREFERRED: 'pnpm',

  /** Execute commands */
  EXEC_COMMANDS: {
    pnpm: 'pnpx',
  },
}

// Template Configuration
export const TEMPLATES = {
  /** Default template name */
  DEFAULT_TEMPLATE: 'default',

  /** Available templates */
  AVAILABLE_TEMPLATES: ['default-stdio', 'default-http'],

  /** Template source directory */
  TEMPLATES_DIR: 'src/templates',
}

export const STDIO_LOG_SILENT = 1

export function isStdioLogSilent(): boolean {
  return STDIO_LOG_SILENT === 1
}

// Type Exports
export type TransportType =
  (typeof TRANSPORT.TRANSPORT_TYPES)[keyof typeof TRANSPORT.TRANSPORT_TYPES]
export type TemplateName = (typeof TEMPLATES.AVAILABLE_TEMPLATES)[number]
export type PackageManager = typeof PACKAGE_MANAGER.PREFERRED

// =============================================================================
// DYNEMCP CLI CONFIGURATION
// =============================================================================

export const DYNEMCP_CLI = {
  /** CLI script name */
  SCRIPT_NAME: 'dynemcp',

  /** CLI usage text */
  USAGE: '$0 <cmd> [args]',

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
}

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
    MIDDLEWARE_NOT_FOUND: `${LOGGING.EMOJIS.ERROR} [SECURITY] WARNING: No user authentication middleware found (src/middleware.ts). All requests will be allowed. This is unsafe for production.`,
  },
}

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
}

// =============================================================================
// DYNEMCP INSPECTOR CONFIGURATION
// =============================================================================

export const DYNEMCP_INSPECTOR = {
  /** Inspector command configuration */
  COMMANDS: {
    PACKAGE_MANAGER: PACKAGE_MANAGER.EXEC_COMMANDS.pnpm,
    PACKAGE_NAME: '@modelcontextprotocol/inspector',
    STDIO_ARGS: ['node'],
    HTTP_ARGS: [],
  },

  /** Inspector timing */
  TIMING: {
    SERVER_DELAY: 2000,
    READY_TIMEOUT: 10000,
  },
}

// =============================================================================
// DYNEMCP HELPER FUNCTIONS
// =============================================================================

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
      PATHS.BUILD_OUTPUT_FILE,
    ]
  }

  return baseArgs
}

/**
 * Get spawn options for Inspector process
 */
export function getInspectorSpawnOptions(transportType: TransportType) {
  const baseOptions = { stdio: 'inherit' }

  return baseOptions
}
