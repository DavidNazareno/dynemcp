/**
 * Create-DyneMCP Package Configuration
 *
 * Package-specific configuration for the create-dynemcp package.
 * Imports from global config and adds create-dynemcp-specific settings.
 */

// =============================================================================
// GLOBAL CONFIGURATION (imported inline to avoid path issues)
// =============================================================================

const SDK_VERSION = '1.13.3'
const INSPECTOR_VERSION = '0.15.0'

// Network Configuration
const NETWORK = {
  DEFAULT_HTTP_PORT: 3001,
  DEFAULT_HTTP_HOST: 'localhost',
  DEFAULT_MCP_ENDPOINT: '/mcp',
} as const

// Paths Configuration
const PATHS = {
  DEFAULT_CONFIG: 'dynemcp.config.json',
  SOURCE_DIR: 'src',
} as const

// Template Configuration
const TEMPLATES = {
  DEFAULT_TEMPLATE: 'default',
  AVAILABLE_TEMPLATES: ['default-stdio', 'default-http'],
  TEMPLATES_DIR: 'src/templates',
  TEMPLATE_CONFIG: 'dynemcp.config.json',
} as const

// Logging Configuration
const LOGGING = {
  EMOJIS: {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    LOADING: '🔄',
  },
} as const

// Package Manager Configuration
const PACKAGE_MANAGER = {
  PREFERRED: 'pnpm',
  ALTERNATIVES: [] as const,
  EXEC_COMMANDS: {
    pnpm: 'pnpx',
  },
} as const

// Type Exports
export type TemplateName = (typeof TEMPLATES.AVAILABLE_TEMPLATES)[number]
export type PackageManager =
  | typeof PACKAGE_MANAGER.PREFERRED
  | (typeof PACKAGE_MANAGER.ALTERNATIVES)[number]

// Export configurations for use in the module
// Note: These are now available as constants in this module

// =============================================================================
// CREATE-DYNEMCP CLI CONFIGURATION
// =============================================================================

export const CREATE_DYNEMCP_CLI = {
  /** CLI script name */
  SCRIPT_NAME: 'create-dynemcp',

  /** CLI usage text */
  USAGE: 'create-dynemcp [project-name] [options]',

  /** CLI description */
  DESCRIPTION: 'Create a new DyneMCP project with template selection',

  /** CLI examples */
  EXAMPLES: {
    BASIC: 'create-dynemcp my-mcp-server',
    WITH_TEMPLATE: 'create-dynemcp my-calc-server --template calculator',
    WITH_PACKAGE_MANAGER: 'create-dynemcp my-server --package-manager yarn',
    WITH_ALL_OPTIONS:
      'create-dynemcp my-server --template calculator --package-manager pnpm --install',
  },
} as const

// =============================================================================
// CREATE-DYNEMCP PROJECT CONFIGURATION
// =============================================================================

export const CREATE_DYNEMCP_PROJECT = {
  /** Default project settings */
  DEFAULTS: {
    template: TEMPLATES.DEFAULT_TEMPLATE,
    packageManager: PACKAGE_MANAGER.PREFERRED,
    install: true,
    overwrite: false,
    git: true,
  },

  /** Project name validation */
  VALIDATION: {
    /** Valid project name pattern */
    NAME_PATTERN: /^[a-z0-9-_]+$/,
    /** Minimum project name length */
    MIN_NAME_LENGTH: 2,
    /** Maximum project name length */
    MAX_NAME_LENGTH: 50,
    /** Reserved names that cannot be used */
    RESERVED_NAMES: [
      'dynemcp',
      'create-dynemcp',
      'mcp',
      'node_modules',
      'package',
      'index',
      'main',
      'src',
      'dist',
      'build',
      'test',
      'tests',
    ] as readonly string[],
  },

  /** Project structure */
  STRUCTURE: {
    sourceDir: PATHS.SOURCE_DIR,
    configFile: PATHS.DEFAULT_CONFIG,
    packageFile: 'package.json',
    readmeFile: 'README.md',
    gitignoreFile: '.gitignore',
    tsconfigFile: 'tsconfig.json',
  },
} as const

// =============================================================================
// CREATE-DYNEMCP TEMPLATE CONFIGURATION
// =============================================================================

export const CREATE_DYNEMCP_TEMPLATES = {
  /** Template source configuration */
  SOURCE: {
    baseDir: TEMPLATES.TEMPLATES_DIR,
    configFile: TEMPLATES.TEMPLATE_CONFIG,
  },

  /** Template metadata */
  METADATA: {
    'default-stdio': {
      name: 'Default STDIO',
      description: 'Basic MCP server with tools, resources, and prompts',
      transport: 'stdio',
      features: ['tools', 'resources', 'prompts', 'roots', 'samples'],
    },
    'default-http': {
      name: 'Default HTTP',
      description: 'Basic MCP server with tools, resources, and prompts',
      transport: 'streamable-http',
      features: ['tools', 'resources', 'prompts', 'roots', 'samples'],
    },
  },

  /** Template default configurations */
  DEFAULTS: {
    'default-stdio': {
      port: NETWORK.DEFAULT_HTTP_PORT,
      transport: 'stdio',
    },
    'default-http': {
      port: NETWORK.DEFAULT_HTTP_PORT,
      transport: 'streamable-http',
    },
  },
} as const

// =============================================================================
// CREATE-DYNEMCP MESSAGES
// =============================================================================

export const CREATE_DYNEMCP_MESSAGES = {
  /** Success messages */
  SUCCESS: {
    PROJECT_CREATED: (name: string) =>
      `${LOGGING.EMOJIS.SUCCESS} Project '${name}' created successfully!`,
    TEMPLATE_COPIED: (template: string) =>
      `${LOGGING.EMOJIS.SUCCESS} Template '${template}' copied`,
    DEPENDENCIES_INSTALLED: `${LOGGING.EMOJIS.SUCCESS} Dependencies installed`,
    GIT_INITIALIZED: `${LOGGING.EMOJIS.SUCCESS} Git repository initialized`,
    READY: (name: string) =>
      `${LOGGING.EMOJIS.SUCCESS} Your DyneMCP project '${name}' is ready!`,
  },

  /** Progress messages */
  PROGRESS: {
    CREATING_PROJECT: (name: string) =>
      `${LOGGING.EMOJIS.LOADING} Creating project '${name}'...`,
    COPYING_TEMPLATE: (template: string) =>
      `${LOGGING.EMOJIS.LOADING} Copying template '${template}'...`,
    INSTALLING_DEPENDENCIES: `${LOGGING.EMOJIS.LOADING} Installing dependencies...`,
    INITIALIZING_GIT: `${LOGGING.EMOJIS.LOADING} Initializing Git repository...`,
    GENERATING_FILES: `${LOGGING.EMOJIS.LOADING} Generating project files...`,
  },

  /** Error messages */
  ERRORS: {
    PROJECT_EXISTS: (name: string) =>
      `${LOGGING.EMOJIS.ERROR} Project '${name}' already exists`,
    INVALID_NAME: (name: string) =>
      `${LOGGING.EMOJIS.ERROR} Invalid project name: '${name}'`,
    TEMPLATE_NOT_FOUND: (template: string) =>
      `${LOGGING.EMOJIS.ERROR} Template '${template}' not found`,
    COPY_FAILED: (template: string) =>
      `${LOGGING.EMOJIS.ERROR} Failed to copy template '${template}'`,
    INSTALL_FAILED: `${LOGGING.EMOJIS.ERROR} Failed to install dependencies`,
    GIT_FAILED: `${LOGGING.EMOJIS.ERROR} Failed to initialize Git repository`,
    CREATION_FAILED: (name: string) =>
      `${LOGGING.EMOJIS.ERROR} Failed to create project '${name}'`,
  },

  /** Warning messages */
  WARNINGS: {
    NO_PACKAGE_MANAGER: (pm: string) =>
      `${LOGGING.EMOJIS.WARNING} Package manager '${pm}' not found, using npm`,
    SKIP_GIT: `${LOGGING.EMOJIS.WARNING} Skipping Git initialization`,
    SKIP_INSTALL: `${LOGGING.EMOJIS.WARNING} Skipping dependency installation`,
    OVERWRITE: (name: string) =>
      `${LOGGING.EMOJIS.WARNING} Overwriting existing project '${name}'`,
  },

  /** Info messages */
  INFO: {
    AVAILABLE_TEMPLATES: 'Available templates:',
    TEMPLATE_INFO: (name: string, description: string) =>
      `  • ${name}: ${description}`,
    NEXT_STEPS: (name: string) =>
      [
        `\n${LOGGING.EMOJIS.INFO} Next steps:`,
        `  cd ${name}`,
        `  ${PACKAGE_MANAGER.EXEC_COMMANDS[PACKAGE_MANAGER.PREFERRED]} dynemcp dev`,
        `  ${PACKAGE_MANAGER.EXEC_COMMANDS[PACKAGE_MANAGER.PREFERRED]} dynemcp dev inspector`,
      ].join('\n'),
  },
} as const

// =============================================================================
// CREATE-DYNEMCP HELPER FUNCTIONS
// =============================================================================

/**
 * Validate project name
 */
export function validateProjectName(name: string): {
  valid: boolean
  error?: string
} {
  if (
    !name ||
    name.length < CREATE_DYNEMCP_PROJECT.VALIDATION.MIN_NAME_LENGTH
  ) {
    return {
      valid: false,
      error: `Project name must be at least ${CREATE_DYNEMCP_PROJECT.VALIDATION.MIN_NAME_LENGTH} characters long`,
    }
  }

  if (name.length > CREATE_DYNEMCP_PROJECT.VALIDATION.MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Project name must be less than ${CREATE_DYNEMCP_PROJECT.VALIDATION.MAX_NAME_LENGTH} characters long`,
    }
  }

  if (!CREATE_DYNEMCP_PROJECT.VALIDATION.NAME_PATTERN.test(name)) {
    return {
      valid: false,
      error:
        'Project name can only contain lowercase letters, numbers, hyphens, and underscores',
    }
  }

  if (
    CREATE_DYNEMCP_PROJECT.VALIDATION.RESERVED_NAMES.includes(
      name.toLowerCase()
    )
  ) {
    return {
      valid: false,
      error: `Project name '${name}' is reserved and cannot be used`,
    }
  }

  return { valid: true }
}

/**
 * Get template metadata
 */
export function getTemplateMetadata(template: TemplateName) {
  return (
    CREATE_DYNEMCP_TEMPLATES.METADATA[template] ||
    CREATE_DYNEMCP_TEMPLATES.METADATA['default-stdio']
  )
}

/**
 * Get template default configuration
 */
export function getTemplateDefaults(template: TemplateName) {
  return (
    CREATE_DYNEMCP_TEMPLATES.DEFAULTS[template] ||
    CREATE_DYNEMCP_TEMPLATES.DEFAULTS['default-stdio']
  )
}

/**
 * Get available templates with descriptions
 */
export function getAvailableTemplates() {
  return TEMPLATES.AVAILABLE_TEMPLATES.map((template) => ({
    template: template,
    ...getTemplateMetadata(template),
  }))
}

/**
 * Get package manager executable command
 */
export function getPackageManagerCommand(
  packageManager: PackageManager
): string {
  return (
    PACKAGE_MANAGER.EXEC_COMMANDS[packageManager] ||
    PACKAGE_MANAGER.EXEC_COMMANDS[PACKAGE_MANAGER.PREFERRED]
  )
}

/**
 * Create project directory structure paths
 */
export function createProjectPaths(projectName: string) {
  return {
    root: `./${projectName}`,
    src: `./${projectName}/${CREATE_DYNEMCP_PROJECT.STRUCTURE.sourceDir}`,
    config: `./${projectName}/${CREATE_DYNEMCP_PROJECT.STRUCTURE.configFile}`,
    package: `./${projectName}/${CREATE_DYNEMCP_PROJECT.STRUCTURE.packageFile}`,
    readme: `./${projectName}/${CREATE_DYNEMCP_PROJECT.STRUCTURE.readmeFile}`,
    gitignore: `./${projectName}/${CREATE_DYNEMCP_PROJECT.STRUCTURE.gitignoreFile}`,
    tsconfig: `./${projectName}/${CREATE_DYNEMCP_PROJECT.STRUCTURE.tsconfigFile}`,
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  NETWORK,
  PATHS,
  TEMPLATES,
  LOGGING,
  PACKAGE_MANAGER,
  SDK_VERSION,
  INSPECTOR_VERSION,
}
