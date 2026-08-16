import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'blockclock-adapter',
  title: 'Blockclock Adapter',
  license: 'MIT',
  packageRepo: 'https://github.com/wahidsaleemi/blockclock-adapter-startos',
  upstreamRepo: 'https://github.com/billerickson/Umbrel-Blockclock-Adapter',
  marketingUrl: 'https://github.com/billerickson/Umbrel-Blockclock-Adapter',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    'blockclock-adapter': {
      source: {
        dockerBuild: {},
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    mempool: {
      description:
        'Provides block height, block age, and fee data. The adapter calls the Mempool HTTP API.',
      optional: false,
      metadata: {
        title: 'Mempool',
        icon: 'https://raw.githubusercontent.com/Start9Labs/mempool-startos/master/icon.svg',
      },
    },
  },
})
