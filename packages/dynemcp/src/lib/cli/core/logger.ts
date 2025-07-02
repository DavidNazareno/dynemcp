import chalk from 'chalk'

// Logger utilities for DyneMCP CLI
// Provides ConsoleLogger and StderrLogger for colored and error stream logging.

// Logger interface for consistent logging methods
export interface Logger {
  log(message: string): void
  warn(message: string): void
  error(message: string): void
  info(message: string): void
  success(message: string): void
  debug(message: string): void
}

// ConsoleLogger: logs to stdout with colors
export class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message)
  }
  warn(message: string) {
    console.warn(chalk.yellow(message))
  }
  error(message: string) {
    console.error(chalk.red(message))
  }
  info(message: string) {
    console.info(chalk.blue(message))
  }
  success(message: string) {
    console.log(chalk.green(message))
  }
  debug(message: string) {
    console.debug(chalk.gray(message))
  }
}

// StderrLogger: logs to stderr with colors
export class StderrLogger implements Logger {
  log(message: string) {
    console.error(message)
  }
  warn(message: string) {
    console.error(chalk.yellow(message))
  }
  error(message: string) {
    console.error(chalk.red(message))
  }
  info(message: string) {
    console.error(chalk.blue(message))
  }
  success(message: string) {
    console.error(chalk.green(message))
  }
  debug(message: string) {
    console.error(chalk.gray(message))
  }
}
