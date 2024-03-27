import {
  ComponentHarness,
  HarnessLoader,
  HarnessPredicate,
  TestElement
} from '@angular/cdk/testing'
import {
  MatButtonHarness
} from '@angular/material/button/testing'
import {
  MatDialogHarness
} from '@angular/material/dialog/testing'
import {
  MatMenuItemHarness
} from '@angular/material/menu/testing'
import {
  MatRowHarness,
  MatTableHarness
} from '@angular/material/table/testing'
import {
  MessageActions,
  MessageType
} from './interfaces'

interface AncestorHarnessConfig<T extends ComponentHarness> {
  itemTag: string
  itemHarnessPredicate: HarnessPredicate<T>
}

export class BaseHarness extends ComponentHarness {
  private idAttribute = 'data-id'
  private rootLoader?: HarnessLoader

  public initRootLoader(loader: HarnessLoader): void {
    if (!this.rootLoader) {
      this.rootLoader = loader
    }
  }

  protected getRootLoader(): HarnessLoader {
    if (!this.rootLoader) {
      console.error('root loader was not initialized')
      throw new Error('root loader was not initialized')
    }
    return this.rootLoader
  }

  // TODO: convert to private once ancestorSelector is managed centrally via getCssSelector (not passed to it)
  protected ancestorSelector: string = ''
  protected ancestorHarnessConfig?: AncestorHarnessConfig<MatRowHarness>

  protected getIdSelector(id: string): string {
    return `[${this.idAttribute}="${id}"]`
  }

  protected getCssSelector(id: string, tags: string[], ancestorSelector: string = '', postfix: string = ''): string {
    return tags.reduce((selector: string, tag: string) => {
      if (selector) {
        selector = `${selector},`
      }
      return `${selector}${ancestorSelector}${tag}${this.getIdSelector(id)}${postfix}`
    }, '')
  }

  protected getThisHarnessCopy(): this {
    return Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this)
    )
  }

  /**
   *  we need to call this method at the beginning of target methods
   *  if we want to make them work with harness based wrappers;
   *
   *  All wrappers are based on data-id attribute;
   *  However, in some cases we don't want to expose data-id values in tests and rely on something else;
   *  e.g. we don't want to work with entity ids in e2e tests since we generally don't know them;
   *  Entity ids could be use to provide unique data-ids, but we use either attributes to figure them out on the fly;
   *  During the process we have to look up for harnesses with these specific attributes;
   *  The process should use polling to be useful in e2e environment;
   */
  protected async updateAncestorSelector(): Promise<void> {
    if (this.ancestorHarnessConfig) {
      const lookupConfig = this.ancestorHarnessConfig
      const ancestor = await this.waitFor({
        lookup: async () => {
          return await this.locatorFor(lookupConfig.itemHarnessPredicate)()
        },
        errorMessage: `No ancestor with given predicate found`
      })
      const host = await ancestor.host()
      const hostId = await host.getAttribute(this.idAttribute)
      if (!hostId) {
        throw new Error(`Cannot execute the method: the host element of the harness returned by the wrapper does not have ${this.idAttribute} property`)
      }
      this.ancestorSelector = `${this.ancestorHarnessConfig.itemTag}${this.getIdSelector(hostId)} `
    }
  }

  protected async getLookupResult<T>(lookup: () => Promise<T | null>): Promise<T | null> {
    let result: T | null
    try {
      result = await lookup()
    }
    catch (err) {
      console.log('############## START: lookup failure ################')
      console.log(err)
      console.log('############## END: lookup failure ################')
      result = null
    }
    return result
  }

  protected async waitFor<T extends TestElement | ComponentHarness | boolean>(options: {
    lookup: () => Promise<T | null>
    action?: (result: T) => Promise<void>
    errorMessage: string
  }): Promise<T> {
    // no need to do polling in unit tests
    // since component harnesses stabilize them internally
    const result = await this.getLookupResult(options.lookup)
    if (!result) {
      throw new Error(options.errorMessage)
    }
    else {
      if (options.action) {
        await options.action(result)
      }
    }
    return result
  }

  protected markAssertionAsValidExpectation(): void {
    // this is needed to make Jasmine and its reporter
    // treat our custom assertions as valid expectations;
    // otherwise they will mark specs with only custom assertions
    // as ones without expectations;
    expect(1).toBe(1)
  }

  /********************************
   * WRAPPERS
   *******************************/
  // +
  public inElement(id: string): this {
    const copy = this.getThisHarnessCopy()
    copy.ancestorSelector = `div${this.getIdSelector(id)} `
    return copy
  }

  public inMatTableRow(tableId: string, rowFilter: Record<string, string>): this {
    const copy = this.getThisHarnessCopy()
    copy.ancestorHarnessConfig = {
      itemHarnessPredicate: MatRowHarness.with({
        ancestor: this.getIdSelector(tableId)
      }).addOption(`row`, rowFilter, async (harness, rowFilter) => {
        const rowValues = await harness.getCellTextByColumnName()
        return Object.keys(rowFilter).every((key) => {
          return rowValues[key] === rowFilter[key]
        })
      }),
      itemTag: 'tr'
    }
    return copy
  }

  /********************************
   * ACTIONS
   *******************************/
  // +
  public async clickElement(id: string): Promise<void> {
    await this.updateAncestorSelector()
    const disabableTags = ['button']
    const regularTags = [
      'a',
      'div',
      'mat-card'
    ]
    const cssSelectorDisabable = this.getCssSelector(id, disabableTags, this.ancestorSelector, ':not([disabled])')
    const cssSelectorRegular = this.getCssSelector(id, regularTags, this.ancestorSelector)

    await this.waitFor({
      lookup: async () => {
        return await this.locatorFor(`${cssSelectorDisabable},${cssSelectorRegular}`)()
      },
      errorMessage: `No element for selector ${cssSelectorDisabable},${cssSelectorRegular} found.`,
      action: async (element: TestElement) => {
        await element.click()
      }
    })
  }

  // +
  public async messageBoxClick(action: MessageActions): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        const messageBox = await this.getRootLoader().getHarness(MatDialogHarness)
        return await messageBox.getHarness(MatButtonHarness.with({
          selector: `${this.getIdSelector(`${action}Button`)}`
        }))
      },
      errorMessage: `No message box button for action ${action} found.`,
      action: async (button: MatButtonHarness) => {
        await button.click()
      }
    })
  }

  // +
  public async enterValue(id: string, value: string, blur: boolean = true): Promise<void> {
    const cssSelector = this.getCssSelector(id, [
      'input',
      'textarea'
    ])
    await this.waitFor({
      lookup: async () => {
        return await this.locatorFor(cssSelector)()
      },
      errorMessage: `No element for selector ${cssSelector} found.`,
      action: async (input) => {
        if (value.length) {
          await input.setInputValue(value)
        }
        else {
          await input.clear()
        }
        await input.dispatchEvent('input')
        if (blur) {
          await input.blur()
        }
      }
    })
  }

  // +
  public async selectMatMenuItem(text: string): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        return await this.getRootLoader().getHarness(MatMenuItemHarness.with({
          text: text
        }))
      },
      errorMessage: `No mat menu item with text '${text}' found`,
      action: async (matMenuItem: MatMenuItemHarness) => {
        await matMenuItem.click()
      }
    })
  }

  /********************************
   * ASSERTIONS
   *******************************/
  // +
  public async expectElementVisible(id: string, visible: boolean): Promise<void> {
    const cssSelector = this.getCssSelector(id, [
      'h1',
      'p',
      'div',
      'button',
      'a',
      'td',
      'mat-error',
      'mat-card'
    ])
    await this.waitFor({
      lookup: async () => {
        let elementVisible: boolean
        const element = await this.locatorForOptional(cssSelector)()
        if (element) {
          const display = await element.getCssValue('display')
          const visibility = await element.getCssValue('visibility')
          elementVisible = (display !== 'none' && visibility !== 'hidden')
        }
        else {
          elementVisible = false
        }
        return elementVisible === visible
      },
      errorMessage: `No ${visible ? 'visible' : 'invisible'} element for selector ${cssSelector} found`
    })
    this.markAssertionAsValidExpectation()
  }

  // +
  public async expectElementText(id: string, text: string): Promise<void> {
    await this.updateAncestorSelector()
    const cssSelector = this.getCssSelector(id, [
      'h1',
      'h4',
      'p',
      'div',
      'span',
      'button',
      'td',
      'mat-icon'
    ], this.ancestorSelector)
    await this.waitFor({
      lookup: async () => {
        const element = await this.locatorFor(cssSelector)()
        return await element.text() === text
      },
      errorMessage: `No element for selector ${cssSelector} with text '${text}' found`
    })
    this.markAssertionAsValidExpectation()
  }

  // +
  public async expectElementClass(id: string, cssClass: string, present: boolean): Promise<void> {
    await this.updateAncestorSelector()
    const cssSelector = this.getCssSelector(id, [
      'mat-toolbar',
      'button'
    ], this.ancestorSelector)

    await this.waitFor({
      lookup: async () => {
        const element = await this.locatorFor(cssSelector)()
        return await element.hasClass(cssClass) === present
      },
      errorMessage: `No element for selector ${cssSelector} with css class '${cssClass}' found`
    })
    this.markAssertionAsValidExpectation()
  }

  // +
  public async expectButtonEnabled(id: string, enabled: boolean): Promise<void> {
    const cssSelector = `button${this.getIdSelector(id)}`
    await this.waitFor({
      lookup: async () => {
        const button = await this.locatorFor(cssSelector)()
        return await button.getProperty('disabled') === !enabled
      },
      errorMessage: `No ${enabled ? 'enabled' : 'disabled'} element for selector ${cssSelector} found`
    })
    this.markAssertionAsValidExpectation()
  }

  // +
  public async expectInputValue(id: string, value: string): Promise<void> {
    const cssSelector = this.getCssSelector(id, [
      'input',
      'textarea'
    ])

    await this.waitFor({
      lookup: async () => {
        const input = await this.locatorFor(cssSelector)()
        return await input.getProperty('value') === value
      },
      errorMessage: `No element for selector ${cssSelector} with value '${value}' found`
    })
    this.markAssertionAsValidExpectation()
  }

  // +
  public async expectMessageBoxPresent(type: MessageType, message?: string): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        const messageBox = await this.getRootLoader().getHarnessOrNull(MatDialogHarness.with({
          selector: `#${type}MessageBox`
        }).addOption('message', message, async (harness, message): Promise<boolean> => {
          const actualMessage = await harness.getContentText()
          return actualMessage === message
        }))
        return !!messageBox
      },
      errorMessage: `No message box of type ${type} with message '${message}' found`
    })
    this.markAssertionAsValidExpectation()
  }

  public async expectMatTableNRows(id: string, nRows: number): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        const matTable = await this.locatorFor(MatTableHarness.with({
          selector: this.getIdSelector(id)
        }))()
        return (await matTable.getRows()).length === nRows
      },
      errorMessage: `No mat table ${id} with ${nRows} rows found`
    })
  }

  // +
  public async expectMatDialogPresent(dialogId: string, present: boolean): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        const matDialog = await this.getRootLoader().getHarnessOrNull(MatDialogHarness.with({
          selector: `#${dialogId}`
        }))
        return !!matDialog === present
      },
      errorMessage: present ? `No mat dialog ${dialogId} found` : `Mat dialog ${dialogId} found`
    })
    this.markAssertionAsValidExpectation()
  }
}
