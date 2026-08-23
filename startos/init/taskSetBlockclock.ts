import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { configure } from '../actions/configure'
import { i18n } from '../i18n'

/**
 * On fresh install there is no BLOCKCLOCK address yet — main() refuses to
 * start the daemon until one is set. Surface a critical task pointing the
 * user at the Configure action so the service page explains what to do
 * instead of showing a raw launch error.
 */
export const taskSetBlockclock = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const url = await storeJson.read((s) => s.blockclockUrl).once()
  if (url) return

  await sdk.action.createOwnTask(effects, configure, 'critical', {
    reason: i18n(
      'Set your BLOCKCLOCK address to finish setup: run Configure, enter the BLOCKCLOCK URL (e.g. http://192.168.1.50), then start the service.',
    ),
  })
})
