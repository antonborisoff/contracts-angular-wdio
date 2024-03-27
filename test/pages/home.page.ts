import {
  WaitingHarness
} from '../utils/waiting.component.harness.js'
import {
  Utils
} from '../utils/utils.js'

// we use harness as lookup scope limiting view
// this is also where we define custom local methods
class HomeHarness extends WaitingHarness {
  public static hostSelector = 'app-home'
}
export class HomePage {
  static #contractsCardId = 'navToContractsLink'

  /*******************************************
   * ACTIONS
   ******************************************/
  public static async iOpenContracts(): Promise<void> {
    const harness = await Utils.waitForHarness(HomeHarness)
    await harness.clickElement(this.#contractsCardId)
    // wait for operation completion
    await Utils.waitForPageLeft(HomeHarness)
  }
  /*******************************************
   * ASSERTIONS
   ******************************************/
}
