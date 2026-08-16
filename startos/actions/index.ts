import { sdk } from '../sdk'
import { configure } from './configure'
import { acknowledgeBlock } from './acknowledgeBlock'

export const actions = sdk.Actions.of().addAction(configure).addAction(acknowledgeBlock)
