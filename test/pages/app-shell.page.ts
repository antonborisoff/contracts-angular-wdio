import {
  WaitingHarness
} from '../utils/waiting.component.harness.js'
import {
  Utils
} from '../utils/utils.js'

// we use harness as lookup scope limiting view
// this is also where we define custom local methods
class AppShellHarness extends WaitingHarness {
  public static hostSelector = 'app-root'
}
export class AppShellPage {
  static #loggedAppHeaderId = 'appHeader'
  static #logoutButtonId = 'logoutButton'

  /*******************************************
   * ACTIONS
   ******************************************/
  public static async iLogout(): Promise<void> {
    const harness = await Utils.waitForHarness(AppShellHarness)
    await harness.clickElement(this.#logoutButtonId)
    // wait for operation completion
    await harness.expectElementVisible(this.#loggedAppHeaderId, false)
  }

  /*******************************************
   * ASSERTIONS
   ******************************************/
  public static async iShouldBeLogged(): Promise<void> {
    const harness = await Utils.waitForHarness(AppShellHarness)
    await harness.expectElementVisible(this.#loggedAppHeaderId, true)
  }
}
