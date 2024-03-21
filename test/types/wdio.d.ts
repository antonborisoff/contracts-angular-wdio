// import required for proper type extension, but ts lint complains, so we switch it off for import
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Browser
} from '@wdio/globals/types'
/* eslint-enable @typescript-eslint/no-unused-vars */

declare global {
  namespace WebdriverIO {
    interface Browser {
      isFeatureActive: (feature: string) => Promise<boolean>
    }
  }
}
