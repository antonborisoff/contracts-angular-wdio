import {
  BaseHarness
} from './base.component.harness.js'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 *
 * This base harness is designed for testing environments with async operations beyond Angular framework e.g. e2e tests against real apps;
 * It provides common waiters that might indicate such operations completion and general framework to implement custom waiters;
 * The methods are based on visual indications of such operations completion;
 * UX requires such indicators to be present to notify users about ongoing operations;
 */
export class WaitingHarness extends BaseHarness {
  protected waitForTimeoutInterval = 15000
  protected waitForPollingInterval = 400

  protected async waitFor(condition: () => Promise<boolean>, errorMessage: string): Promise<void> {
    let conditionFulfilled = await condition()
    const endTime = Date.now() + this.waitForTimeoutInterval
    while (!conditionFulfilled && Date.now() < endTime) {
      await wait(this.waitForPollingInterval)
      conditionFulfilled = await condition()
    }
    if (!conditionFulfilled) {
      throw new Error(errorMessage)
    }
  }

  public withTimeout(timeoutInterval?: number): this {
    if (timeoutInterval) {
      const copy = Object.create(
        Object.getPrototypeOf(this),
        Object.getOwnPropertyDescriptors(this)
      ) as this
      copy.waitForTimeoutInterval = timeoutInterval
      return copy
    }
    else {
      return this
    }
  }

  // for elements blocked with appBusy directive
  public async waitForElementFree(id: string): Promise<void> {
    const condition = async (): Promise<boolean> => {
      const cssSelector = this.getCssSelector(id, ['div'], this.ancestorSelector, ':not([data-busy="true"])')
      return !!(await this.locatorForOptional(cssSelector)())
    }
    await this.waitFor(condition, `Waiting for element ${id} becoming free failed: timeout exceeded, but element is still busy.`)
  }

  // for elements hidden via @if + async
  public async waitForElementPresent(id: string, present: boolean = true): Promise<void> {
    const condition = async (): Promise<boolean> => {
      const cssSelector = this.getCssSelector(id, ['div'], this.ancestorSelector)
      return !!(await this.locatorForOptional(cssSelector)()) === present
    }
    let errorMessage: string
    if (present) {
      errorMessage = `Waiting for element ${id} being present failed: timeout exceeded, but element is still not present.`
    }
    else {
      errorMessage = `Waiting for element ${id} not being present failed: timeout exceeded, but element is still present.`
    }
    await this.waitFor(condition, errorMessage)
  }
}
