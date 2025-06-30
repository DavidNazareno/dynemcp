import chalk from 'chalk'
import { clean } from '../../../build'

export async function cleanHandler(argv: any) {
  console.log(chalk.green('🧹 Cleaning build directory...'))
  await clean({ configPath: argv.config })
}
