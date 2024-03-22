import {
  getHarness
} from '@badisi/wdio-harness'
import {
  WaitingHarness
} from '../utils/waiting.component.harness.js'

// we use harness as lookup scope limiting view
// this is also where we define custom local methods
class AppShellHarness extends WaitingHarness {
  public static hostSelector = 'app-root'
}
export class AppShellPage {
  static #loggedAppHeaderId = 'appHeader'

  public static async iShouldBeLogged(): Promise<void> {
    const harness = await getHarness(AppShellHarness)
    await harness.expectElementVisible(this.#loggedAppHeaderId, true)
  }
}
