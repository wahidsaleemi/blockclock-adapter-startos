import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(
  async ({ effects }) => ({
    mempool: {
      kind: 'running',
      healthChecks: [],
      versionRange: '>=0.0.0',
    },
  }),
)
