import { build } from '../../../build'
import { DYNEMCP_BUILD } from '../../../../global/config-all-contants'

export async function buildHandler(argv: any) {
  console.log(DYNEMCP_BUILD.MESSAGES.BUILDING)
  await build({
    configPath: argv.config,
    clean: argv.clean,
    analyze: argv.analyze,
  })
}
