import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { statusPort } from '../utils'

export const acknowledgeBlock = sdk.Action.withoutInput(
  'acknowledge-block',
  async () => ({
    name: i18n('Acknowledge Block Found'),
    description: i18n(
      'Increment the acknowledged blocks-found counter so the alert leaves the display rotation.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const url = await sdk.host
      .getBridgeAddress(effects, {
        packageId: 'blockclock-adapter',
        hostId: 'main',
        internalPort: statusPort,
        ssl: false,
      })
      .once()

    if (!url) {
      throw new Error(i18n('No blocks found data is currently available.'))
    }

    const response = await fetch(`http://${url}/blocks-found/acknowledge`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const result = await response.json()

    return {
      version: '1' as const,
      title: i18n('Acknowledge Block Found'),
      message: i18n(
        'Increment the acknowledged blocks-found counter so the alert leaves the display rotation.',
      ),
      result: {
        type: 'single' as const,
        name: 'Blocks Found',
        description: null,
        value: `${result.current_block_counter} / ${result.blocks_found}`,
        masked: false,
        copyable: false,
        qr: false,
      },
    }
  },
)
