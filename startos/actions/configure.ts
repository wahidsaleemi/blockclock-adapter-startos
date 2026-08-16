import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const METRIC_VALUES = {
  block_height: 'Block Height',
  block_age: 'Block Age',
  fastest_fee: 'Fastest Fee',
  btc_price: 'BTC Price',
  moscow_time: 'Moscow Time',
  hash_rate: 'Pool Hash Rate',
  blocks_found: 'Blocks Found',
} as const

const DEFAULT_METRICS = Object.keys(METRIC_VALUES) as (keyof typeof METRIC_VALUES)[]

export const configure = sdk.Action.withInput(
  'configure',
  {
    name: i18n('Configure'),
    description: i18n(
      'Set the BLOCKCLOCK address, password, displayed metrics, update interval, and pool/price sources.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  InputSpec.of({
    blockclockUrl: Value.text({
      name: i18n('BLOCKCLOCK URL'),
      description: i18n(
        'HTTP URL of your Coinkite BLOCKCLOCK mini (e.g. http://192.168.1.50)',
      ),
      required: true,
      default: '',
      masked: false,
    }),
    blockclockPassword: Value.text({
      name: i18n('BLOCKCLOCK Password'),
      description: i18n(
        'The system password set on the BLOCKCLOCK web UI. Leave empty if no password is set.',
      ),
      required: false,
      default: '',
      masked: true,
    }),
    enabledMetrics: Value.multiselect({
      name: i18n('Enabled Metrics'),
      description: i18n('Which values to rotate on the display'),
      default: DEFAULT_METRICS,
      values: METRIC_VALUES,
    }),
    displayIntervalSeconds: Value.number({
      name: i18n('Display Interval'),
      description: i18n('Seconds between display rotations (minimum 60)'),
      required: false,
      default: 300,
      min: 60,
      max: 3600,
      step: 15,
      integer: true,
      units: 'seconds',
    }),
    buttonAdvanceEnabled: Value.toggle({
      name: i18n('Button Advance'),
      description: i18n(
        'Monitor the BLOCKCLOCK middle button to advance displays on demand',
      ),
      default: true,
    }),
    buttonPollSeconds: Value.number({
      name: i18n('Button Poll Interval'),
      description: i18n(
        'How often to poll the BLOCKCLOCK status endpoint for button presses',
      ),
      required: false,
      default: 3,
      min: 1,
      max: 30,
      step: 1,
      integer: true,
      units: 'seconds',
    }),
    sourceTimeoutSeconds: Value.number({
      name: i18n('Source Timeout'),
      description: i18n(
        'HTTP timeout for data source requests (mempool, pool, price)',
      ),
      required: false,
      default: 10,
      min: 1,
      max: 60,
      step: 1,
      integer: true,
      units: 'seconds',
    }),
    poolApiUrl: Value.text({
      name: i18n('Pool API URL'),
      description: i18n(
        'Optional: URL of a Public Pool API for hashrate/blocks found. Leave empty to disable pool metrics.',
      ),
      required: false,
      default: '',
      masked: false,
    }),
    priceApiUrl: Value.text({
      name: i18n('Price API URL'),
      description: i18n('HTTPS URL for BTC price data'),
      required: false,
      default: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
      masked: false,
    }),
    priceAllowedHosts: Value.text({
      name: i18n('Allowed Price Hosts'),
      description: i18n(
        'Comma-separated list of allowed HTTPS hostnames for price redirects',
      ),
      required: false,
      default: 'api.coinbase.com',
      masked: false,
    }),
  }),
  async ({ effects }) => {
    const store = await storeJson.read().once()
    return {
      blockclockUrl: store?.blockclockUrl ?? '',
      blockclockPassword: store?.blockclockPassword ?? '',
      enabledMetrics: (
      store?.enabledMetrics
        ? store.enabledMetrics.split(',').filter(Boolean)
        : DEFAULT_METRICS
    ) as (keyof typeof METRIC_VALUES)[],
      displayIntervalSeconds: store?.displayIntervalSeconds ?? 300,
      buttonAdvanceEnabled: store?.buttonAdvanceEnabled ?? true,
      buttonPollSeconds: store?.buttonPollSeconds ?? 3,
      sourceTimeoutSeconds: store?.sourceTimeoutSeconds ?? 10,
      poolApiUrl: store?.poolApiUrl ?? '',
      priceApiUrl:
        store?.priceApiUrl ??
        'https://api.coinbase.com/v2/prices/BTC-USD/spot',
      priceAllowedHosts: store?.priceAllowedHosts ?? 'api.coinbase.com',
    }
  },
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      blockclockUrl: input.blockclockUrl,
      blockclockPassword: input.blockclockPassword ?? '',
      enabledMetrics: Array.isArray(input.enabledMetrics)
        ? input.enabledMetrics.join(',')
        : String(input.enabledMetrics),
      displayIntervalSeconds: input.displayIntervalSeconds ?? 300,
      buttonAdvanceEnabled: input.buttonAdvanceEnabled,
      buttonPollSeconds: input.buttonPollSeconds ?? 3,
      sourceTimeoutSeconds: input.sourceTimeoutSeconds ?? 10,
      poolApiUrl: input.poolApiUrl ?? '',
      priceApiUrl: input.priceApiUrl ?? 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
      priceAllowedHosts: input.priceAllowedHosts ?? 'api.coinbase.com',
    })
  },
)
