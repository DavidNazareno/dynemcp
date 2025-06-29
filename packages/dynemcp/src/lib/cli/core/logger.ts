import chalk from 'chalk'
export interface Logger {
  log(message: string): void
  warn(message: string): void
  error(message: string): void
  info(message: string): void
  success(message: string): void
  debug(message: string): void
}
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
