import {
  LoginPage
} from '../pages/login.page.js'
import {
  AppShellPage
} from '../pages/app-shell.page.js'
import {
  HomePage
} from '../pages/home.page.js'
import {
  ContractsPage
} from '../pages/contracts.page.js'

describe('Contracts', () => {
  beforeEach(async () => {
    await LoginPage.iLogin()
    if (await browser.isFeatureActive('FT_Contracts')) {
      await HomePage.iOpenContracts()
    }
  })

  afterEach(async () => {
    await AppShellPage.iLogout()
  })

  it('create a contract', async () => {
    if (!(await browser.isFeatureActive('FT_Contracts'))) {
      return
    }

    const contract = {
      number: `APXE2E ${Date.now()}`,
      conditions: 'E2E test conditions'
    }
    await ContractsPage.iCreateContract(contract)
    await ContractsPage.iSearchContract(contract.number)
    await ContractsPage.iShouldSeeContract(contract)
  })

  it('edit a contract', async () => {
    if (!(await browser.isFeatureActive('FT_Contracts'))) {
      return
    }

    const contract = {
      number: `APXE2E ${Date.now()}`,
      conditions: 'E2E test conditions'
    }
    await ContractsPage.iCreateContract(contract)
    const attributesToUpdate = {
      number: `${contract.number} (edited)`,
      conditions: `${contract.conditions} (edited)`
    }

    await ContractsPage.iSearchContract(contract.number)
    await ContractsPage.iEditContract(contract, attributesToUpdate)
    Object.assign(contract, attributesToUpdate)

    await ContractsPage.iSearchContract(contract.number)
    await ContractsPage.iShouldSeeContract(contract)
  })

  it('delete a contract', async () => {
    if (!(await browser.isFeatureActive('FT_Contracts'))) {
      return
    }

    const contract = {
      number: `APXE2E ${Date.now()}`,
      conditions: 'E2E test conditions'
    }
    await ContractsPage.iCreateContract(contract)
    await ContractsPage.iSearchContract(contract.number)
    await ContractsPage.iDeleteContract(contract)
    await ContractsPage.iShouldSeeNoContracts()
  })
})
