export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Blockclock Adapter!': 0,
  'Status API': 1,
  'The status endpoint is ready': 2,
  'The status endpoint is not ready': 3,
  'Web Interface': 4,
  'The web interface is ready': 5,
  'The web interface is not ready': 6,
  // actions/configure.ts
  Configure: 7,
  'Set the BLOCKCLOCK address, password, displayed metrics, update interval, and pool/price sources.': 8,
  'BLOCKCLOCK URL': 9,
  'HTTP URL of your Coinkite BLOCKCLOCK mini (e.g. http://192.168.1.50)': 10,
  'BLOCKCLOCK Password': 11,
  'The system password set on the BLOCKCLOCK web UI. Leave empty if no password is set.': 12,
  'Enabled Metrics': 13,
  'Which values to rotate on the display': 14,
  'Display Interval': 15,
  'Seconds between display rotations (minimum 60)': 16,
  'Button Advance': 17,
  'Monitor the BLOCKCLOCK middle button to advance displays on demand': 18,
  'Button Poll Interval': 19,
  'How often to poll the BLOCKCLOCK status endpoint for button presses': 20,
  'Source Timeout': 21,
  'HTTP timeout for data source requests (mempool, pool, price)': 22,
  'Pool API URL': 23,
  'Optional: URL of a Public Pool API for hashrate/blocks found. Leave empty to disable pool metrics.': 24,
  'Price API URL': 25,
  'HTTPS URL for BTC price data': 26,
  'Allowed Price Hosts': 27,
  'Comma-separated list of allowed HTTPS hostnames for price redirects': 28,
  // init/tasks
  'Configure Blockclock Adapter': 29,
  'Set the BLOCKCLOCK URL and optional password so the adapter can push data to your device.': 30,
  // manifest/i18n.ts
  'Push Bitcoin data to a Coinkite BLOCKCLOCK mini without internet': 31,
  'Blockclock Adapter': 32,
  'Acknowledge Block Found': 33,
  'Increment the acknowledged blocks-found counter so the alert leaves the display rotation.': 34,
  'No blocks found data is currently available.': 35,
  'JSON status endpoint showing current values, errors, and blocks-found state': 36,
  'No BLOCKCLOCK address configured. Run the Configure action and set the BLOCKCLOCK URL (e.g. http://192.168.1.50), then start the service.': 37,
  'Mempool is required but its bridge address is not yet available. Ensure Mempool is installed, running, and fully synced.': 38,
  'Set your BLOCKCLOCK address to finish setup: run Configure, enter the BLOCKCLOCK URL (e.g. http://192.168.1.50), then start the service.': 39,
  'The adapter is not reachable on the internal network. Is the service running?': 40,
  'Could not reach the adapter status endpoint. Is the service running?': 41,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
