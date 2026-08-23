import { sdk } from '../sdk'
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
    // Reach the adapter's own status port over the OS bridge
    const addr = await sdk.host
      .getBridgeAddress(effects, {
        hostId: 'main',
        internalPort: statusPort,
        ssl: false,
      })
      .once()

    if (!addr) {
      throw new Error(
        i18n(
          'The adapter is not reachable on the internal network. Is the service running?',
        ),
      )
    }

    let response: Response
    try {
      response = await fetch(`http://${addr}/blocks-found/acknowledge`, {
        method: 'POST',
      })
    } catch (e) {
      throw new Error(
        i18n(
          'Could not reach the adapter status endpoint. Is the service running?',
        ),
      )
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const result = await response.json()

    return {
      version: '1',
      title: i18n('Acknowledge Block Found'),
      message: i18n(
        'Increment the acknowledged blocks-found counter so the alert leaves the display rotation.',
      ),
      result: {
        type: 'single',
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
