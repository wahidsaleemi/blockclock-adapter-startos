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

/** Single source of truth for defaults — the schema's own catch values. */
export const storeDefaults: Store = shape.parse({})

// Metrics that require a Public Pool API URL to function.
export const POOL_METRICS = ['hash_rate', 'blocks_found'] as const

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)

/**
 * Returns the enabled-metrics CSV to hand to the adapter. Pool-sourced
 * metrics (hash_rate, blocks_found) are stripped unless a Pool API URL is
 * configured — collecting them without one just produces errors every cycle.
 * Falls back to the default set (minus pool metrics) if filtering would
 * leave the list empty, since the adapter rejects an empty metric list.
 */
export function resolveEnabledMetrics(store: Store | null): string {
  const csv = store?.enabledMetrics || storeDefaults.enabledMetrics
  const poolEnabled = Boolean(store?.poolApiUrl)
  let metrics = csv
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)
  if (!poolEnabled) {
    metrics = metrics.filter((m) => !POOL_METRICS.includes(m as never))
  }
  if (!metrics.length) {
    metrics = storeDefaults.enabledMetrics
      .split(',')
      .filter((m) => poolEnabled || !POOL_METRICS.includes(m as never))
  }
  return metrics.join(',')
}
