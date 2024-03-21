import {
  getHarness
} from '@badisi/wdio-harness'
import {
  WaitingHarness
} from '../utils/waiting.component.harness.js'

class AppShellHarness extends WaitingHarness {
  public static hostSelector = 'app-root'
}
export class AppShellPage {
  static #loggedAppHeaderId = 'appHeader'

  public static async iShouldBeLogged(): Promise<void> {
    const harness = await getHarness(AppShellHarness)
    await expectAsync(harness.elementVisible(this.#loggedAppHeaderId)).toBeResolvedTo(true)
  }
}
