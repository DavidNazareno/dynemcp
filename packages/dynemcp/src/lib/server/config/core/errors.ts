/**
 * Custom error class for configuration-related errors in DyneMCP.
 */
export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = 'ConfigError'
  }

  /**
   * Error for missing configuration file.
   * @param path Path to the missing file.
   */
  static fileNotFound(path: string): ConfigError {
    return new ConfigError(
      `Configuration file not found: ${path}`,
      'CONFIG_FILE_NOT_FOUND'
    )
  }

  /**
   * Error for invalid configuration content.
   * @param details Details about the invalid config.
   */
  static invalidConfig(details: string): ConfigError {
    return new ConfigError(
      `Invalid configuration: ${details}`,
      'INVALID_CONFIG'
    )
  }

  /**
   * Error for JSON parse errors in configuration.
   * @param error The parse error details.
   */
  static parseError(error: unknown): ConfigError {
    return new ConfigError(
      `Failed to parse configuration: ${error}`,
      'CONFIG_PARSE_ERROR'
    )
  }
}
