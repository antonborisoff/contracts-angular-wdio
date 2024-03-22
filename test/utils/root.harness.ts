import {
  WaitingHarness
} from './waiting.component.harness.js'
import {
  ComponentHarnessConstructor
} from '@angular/cdk/testing'

export class RootHarness extends WaitingHarness {
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
