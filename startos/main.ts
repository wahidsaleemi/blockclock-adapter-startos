import { i18n } from './i18n'
import { sdk } from './sdk'
import { statusPort } from './utils'
import { resolveEnabledMetrics, storeDefaults, storeJson } from './fileModels/store.json'

// Mempool's UI port and host ID on StartOS (from the mempool-startos package)
const MEMPOOL_PORT = 8080
const MEMPOOL_HOST_ID = 'main'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Blockclock Adapter!'))

  // Read config from store.json — reactive so the daemon restarts on change
  const store = await storeJson.read().const(effects)

  // Without a BLOCKCLOCK address there is nothing to push to; the upstream
  // Python validates this at startup and would crash-loop with a raw traceback.
  // A critical task (see init/taskSetBlockclock.ts) guides the user to Configure.
  if (!store?.blockclockUrl) {
    throw new Error(
      i18n(
        'No BLOCKCLOCK address configured. Run the Configure action and set the BLOCKCLOCK URL (e.g. http://192.168.1.50), then start the service.',
      ),
    )
  }

  // Resolve mempool's bridge address on the StartOS internal network
  const mempoolAddr = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'mempool',
      hostId: MEMPOOL_HOST_ID,
      internalPort: MEMPOOL_PORT,
      ssl: false,
    })
    .const()

  if (!mempoolAddr) {
    throw new Error(
      i18n(
        'Mempool is required but its bridge address is not yet available. Ensure Mempool is installed, running, and fully synced.',
      ),
    )
  }

  // Build the environment for the Python adapter.
  // Pool metrics are stripped when no pool URL is configured — collecting
  // them without one just logs errors every rotation cycle.
  const env: Record<string, string> = {
    MEMPOOL_BASE_URL: `http://${mempoolAddr}`,
    PRICE_API_URL: store.priceApiUrl || storeDefaults.priceApiUrl,
    PRICE_ALLOWED_HOSTS:
      store.priceAllowedHosts || storeDefaults.priceAllowedHosts,
    BLOCKCLOCK_URL: store.blockclockUrl,
    BLOCKCLOCK_PASSWORD: store.blockclockPassword ?? '',
    ENABLED_METRICS: resolveEnabledMetrics(store),
    DISPLAY_INTERVAL_SECONDS: String(
      store.displayIntervalSeconds || storeDefaults.displayIntervalSeconds,
    ),
    BUTTON_ADVANCE_ENABLED: String(store.buttonAdvanceEnabled),
    BUTTON_POLL_SECONDS: String(
      store.buttonPollSeconds || storeDefaults.buttonPollSeconds,
    ),
    SOURCE_TIMEOUT_SECONDS: String(
      store.sourceTimeoutSeconds || storeDefaults.sourceTimeoutSeconds,
    ),
    BIND_HOST: '0.0.0.0',
    BIND_PORT: String(statusPort),
    STATE_FILE: '/var/lib/blockclock-adapter/state.json',
    BLOCKCLOCK_ADAPTER_VERSION: 'startos-1.0.0',
  }

  // Pool API URL is optional — only set if the user provided one
  if (store.poolApiUrl) {
    env.POOL_API_URL = store.poolApiUrl
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
