import {
  Capabilities
} from '@wdio/types'

import deepmerge from 'deepmerge'
import {
  config as baseConfig
} from './wdio.conf.js'

const githubActionsConfig = deepmerge({}, baseConfig, {
  arrayMerge: (destinationArray, sourceArray) => sourceArray,
  clone: false
})

const newCapabilities = baseConfig.capabilities as Capabilities.BrowserStackCapabilities[]
newCapabilities.forEach((capability) => {
  if (capability.browserName === 'chrome') {
    // required for runners used by GitHub Actions
    capability['goog:chromeOptions'].args.push('--headless=new')
  }
})

export const config = githubActionsConfig
