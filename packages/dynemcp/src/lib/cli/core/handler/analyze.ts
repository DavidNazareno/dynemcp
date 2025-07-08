import chalk from 'chalk'
import { analyze } from '../../../build'
import { fileLogger } from '../../../../global/logger'

export async function analyzeHandler(argv: any) {
  fileLogger.info(chalk.green('📊 Analyzing dependencies...'))
  await analyze({ configPath: argv.config })
}
