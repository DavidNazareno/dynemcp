import chalk from 'chalk'
import { analyze } from '../../../build'

export async function analyzeHandler(argv: any) {
  console.log(chalk.green('📊 Analyzing dependencies...'))
  await analyze({ configPath: argv.config })
}
