import { i18n } from './i18n'
import { sdk } from './sdk'
import { statusPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const statusMulti = sdk.MultiHost.of(effects, 'main')
  const statusMultiOrigin = await statusMulti.bindPort(statusPort, {
    protocol: 'http',
  })
  const status = sdk.createInterface(effects, {
    name: i18n('Status API'),
    id: 'status',
    description: i18n(
      'JSON status endpoint showing current values, errors, and blocks-found state',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const statusReceipt = await statusMultiOrigin.export([status])
  return [statusReceipt]
})
