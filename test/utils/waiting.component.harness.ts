import {
  ComponentHarness,
  TestElement
} from '@angular/cdk/testing'
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
 * This base harness is designed for testing environments with async operations beyond Angular framework
 * e.g. e2e tests against real apps;
 * It overrides waitFor method to introduce polling for actions and assertions from the base class;
 */
export class WaitingHarness extends BaseHarness {
  protected waitForTimeoutInterval = 15000
  protected waitForPollingInterval = 400

  protected override async waitFor<T extends TestElement | ComponentHarness | boolean>(options: {
    lookup: () => Promise<T | null>
    action?: (result: T) => Promise<void>
    errorMessage: string
  }): Promise<void> {
    let result = await this.getLookupResult(options.lookup)
    const endTime = Date.now() + this.waitForTimeoutInterval
    while (!result && Date.now() < endTime) {
      await wait(this.waitForPollingInterval)
      result = await this.getLookupResult(options.lookup)
    }
    if (!result) {
      throw new Error(options.errorMessage)
    }
    else {
      if (options.action) {
        await options.action(result)
      }
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
  public async expectElementFree(id: string): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        const cssSelector = this.getCssSelector(id, ['div'], this.ancestorSelector, ':not([data-busy="true"])')
        return !!(await this.locatorForOptional(cssSelector)())
      },
      errorMessage: `Waiting for element ${id} becoming free failed: timeout exceeded, but element is still busy.`
    })
    this.markAssertionAsValidExpectation()
  }
}
