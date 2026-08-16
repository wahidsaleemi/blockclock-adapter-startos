import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  blockclockUrl: z.string().catch(''),
  blockclockPassword: z.string().catch(''),
  enabledMetrics: z
    .string()
    .catch(
      'block_height,block_age,fastest_fee,btc_price,moscow_time,hash_rate,blocks_found',
    ),
  displayIntervalSeconds: z.number().catch(300),
  buttonAdvanceEnabled: z.boolean().catch(true),
  buttonPollSeconds: z.number().catch(3),
  sourceTimeoutSeconds: z.number().catch(10),
  poolApiUrl: z.string().catch(''),
  priceApiUrl: z
    .string()
    .catch('https://api.coinbase.com/v2/prices/BTC-USD/spot'),
  priceAllowedHosts: z.string().catch('api.coinbase.com'),
})

export type Store = z.infer<typeof shape>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
