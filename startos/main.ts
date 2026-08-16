import { i18n } from './i18n'
import { sdk } from './sdk'
import { statusPort } from './utils'
import { storeJson } from './fileModels/store.json'

// Mempool's UI port and host ID on StartOS (from the mempool-startos package)
const MEMPOOL_PORT = 8080
const MEMPOOL_HOST_ID = 'main'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Blockclock Adapter!'))

  // Read config from store.json — reactive so the daemon restarts on change
  const store = await storeJson.read().const(effects)

  // Resolve mempool's bridge address on the StartOS internal network
  const mempoolAddr = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'mempool',
      hostId: MEMPOOL_HOST_ID,
      internalPort: MEMPOOL_PORT,
      ssl: false,
    })
    .const()

  const mempoolBaseUrl = mempoolAddr
    ? `http://${mempoolAddr}`
    : 'http://127.0.0.1:8080'

  // Build the environment for the Python adapter
  const env: Record<string, string> = {
    MEMPOOL_BASE_URL: mempoolBaseUrl,
    PRICE_API_URL: store?.priceApiUrl ?? 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
    PRICE_ALLOWED_HOSTS: store?.priceAllowedHosts ?? 'api.coinbase.com',
    BLOCKCLOCK_URL: store?.blockclockUrl ?? '',
    BLOCKCLOCK_PASSWORD: store?.blockclockPassword ?? '',
    ENABLED_METRICS: store?.enabledMetrics ?? 'block_height,block_age,fastest_fee,btc_price,moscow_time,hash_rate,blocks_found',
    DISPLAY_INTERVAL_SECONDS: String(store?.displayIntervalSeconds ?? 300),
    BUTTON_ADVANCE_ENABLED: String(store?.buttonAdvanceEnabled ?? true),
    BUTTON_POLL_SECONDS: String(store?.buttonPollSeconds ?? 3),
    SOURCE_TIMEOUT_SECONDS: String(store?.sourceTimeoutSeconds ?? 10),
    BIND_HOST: '0.0.0.0',
    BIND_PORT: String(statusPort),
    STATE_FILE: '/var/lib/blockclock-adapter/state.json',
    BLOCKCLOCK_ADAPTER_VERSION: 'startos-1.0.0',
  }

  // Pool API URL is optional — only set if the user provided one
  const poolUrl = store?.poolApiUrl ?? ''
  if (poolUrl) {
    env.POOL_API_URL = poolUrl
  }

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'blockclock-adapter' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/var/lib/blockclock-adapter',
        readonly: false,
      }),
      'blockclock-sub',
    ),
    exec: {
      command: ['python', '-m', 'blockclock_adapter.app'],
      env,
    },
    ready: {
      display: i18n('Status API'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, statusPort, {
          successMessage: i18n('The status endpoint is ready'),
          errorMessage: i18n('The status endpoint is not ready'),
        }),
    },
    requires: [],
  })
})
