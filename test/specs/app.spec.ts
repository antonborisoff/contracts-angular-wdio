import {
  LoginPage
} from '../pages/login.page.js'
import {
  AppShellPage
} from '../pages/app-shell.page.js'

describe('General app functionality', () => {
  it('login the app', async () => {
    await LoginPage.iLogin()
    await AppShellPage.iShouldBeLogged()
  })
})
