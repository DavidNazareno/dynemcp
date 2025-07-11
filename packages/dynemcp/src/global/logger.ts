import chalk from 'chalk'
import pino from 'pino'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

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

// FileLogger: logs to file using Pino
export class FileLogger implements Logger {
  private logger: pino.Logger

  constructor() {
    const logDir = join(process.cwd(), 'logs')
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true })
    }
    const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const logFile = join(logDir, `${date}.log`)
    this.logger = pino(
      {
        level: 'info',
      },
      pino.destination(logFile)
    )
  }

  log(message: string) {
    this.logger.info(message)
  }
  warn(message: string) {
    this.logger.warn(message)
  }
  error(message: string) {
    this.logger.error(message)
  }
  info(message: string) {
    this.logger.info(message)
  }
  success(message: string) {
    this.logger.info(`[SUCCESS] ${message}`)
  }
  debug(message: string) {
    this.logger.debug(message)
  }
}

export const fileLogger = new FileLogger()
