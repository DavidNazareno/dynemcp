import { createTransport, type Transport } from '../../communication'
import { TRANSPORT } from '../../../../global/config-all-contants'
import type { DyneMCPConfig } from '../../config/'

export function setupTransport(config: DyneMCPConfig): Transport {
  const transportConfig = config.transport || {
    type: TRANSPORT.DEFAULT_TRANSPORT,
  }
  return createTransport(transportConfig) as Transport
}
