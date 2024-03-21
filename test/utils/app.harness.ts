import {
  WaitingHarness
} from './waiting.component.harness.js'
import {
  ComponentHarnessConstructor
} from '@angular/cdk/testing'

export class RootHarness extends WaitingHarness {
  public static hostSelector = 'app-root'

  public async waitForPageLeft<T extends WaitingHarness>(page: ComponentHarnessConstructor<T>): Promise<void> {
    const condition = async (): Promise<boolean> => {
      return !(await this.locatorForOptional(page)())
    }
    await this.waitFor(condition, `Waiting for page leaving failed: timeout exceeded, but page is still not left.`)
  }
}
