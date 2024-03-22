import {
  getHarness
} from '@badisi/wdio-harness'
import {
  WaitingHarness
} from '../utils/waiting.component.harness.js'
import {
  RootHarness
} from '../utils/root.harness.js'

// we use harness as lookup scope limiting view
// this is also where we define custom local methods
class LoginHarness extends WaitingHarness {
  public static hostSelector = 'app-login'
}

export class LoginPage {
  static #loginInputId = 'loginInput'
  static #passwordInputId = 'passwordInput'
  static #loginButtonId = 'loginButton'

  static #user = {
    login: 'login a',
    password: 'password a'
  }

  public static async iLogin(): Promise<void> {
    await browser.url('/')

    const harness = await getHarness(LoginHarness)
    await harness.enterValue(this.#loginInputId, this.#user.login)
    await harness.enterValue(this.#passwordInputId, this.#user.password)
    await harness.clickElement(this.#loginButtonId)

    // wait for operation completion
    const rootHarness = await getHarness(RootHarness)
    await rootHarness.expectPageLeft(LoginHarness)
  }
}
