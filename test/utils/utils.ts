import {
  ComponentHarnessConstructor
} from '@angular/cdk/testing'
import {
  WaitingHarness
} from './waiting.component.harness.js'
import {
  getHarness
} from '@badisi/wdio-harness'

class RootHarness extends WaitingHarness {
  public static hostSelector = 'app-root'

  public async expectPageLeft<T extends WaitingHarness>(pageHarness: ComponentHarnessConstructor<T>): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        return !(await this.locatorForOptional(pageHarness)())
      },
      errorMessage: `Waiting for page leaving failed: timeout exceeded, but page is still not left.`
    })
  }
}

export class Utils {
  private static waitForPollingInterval = 400
  private static waitForTimeoutInterval = 5000

  private static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  private static async retrieveHarness<T extends WaitingHarness>(harness: ComponentHarnessConstructor<T>): Promise<T | null> {
    let result: T | null
    try {
      result = await getHarness(harness)
    }
    catch (err) {
      result = null
    }
    return result
  }

  public static async waitForHarness<T extends WaitingHarness>(harness: ComponentHarnessConstructor<T>): Promise<T> {
    let result = await this.retrieveHarness(harness)
    const endTime = Date.now() + this.waitForTimeoutInterval
    while (!result && Date.now() < endTime) {
      await this.wait(this.waitForPollingInterval)
      result = await this.retrieveHarness(harness)
    }
    if (!result) {
      throw new Error('Failed to retrieve harness: harness not found')
    }
    else {
      return result
    }
  }

  public static async waitForPageLeft<T extends WaitingHarness>(harness: ComponentHarnessConstructor<T>): Promise<void> {
    const rootHarness = await this.waitForHarness(RootHarness)
    await rootHarness.expectPageLeft(harness)
  }
}
