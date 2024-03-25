import {
  WaitingHarness
} from '../utils/waiting.component.harness.js'
import {
  Utils
} from '../utils/utils.js'

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

  /*******************************************
   * ACTIONS
   ******************************************/
  public static async iLogin(): Promise<void> {
    await browser.url('/')

    const harness = await Utils.waitForHarness(LoginHarness)
    await harness.enterValue(this.#loginInputId, this.#user.login)
    await harness.enterValue(this.#passwordInputId, this.#user.password)
    await harness.clickElement(this.#loginButtonId)

    // wait for operation completion
    await Utils.waitForPageLeft(LoginHarness)
  }
  /*******************************************
   * ASSERTIONS
   ******************************************/
}
