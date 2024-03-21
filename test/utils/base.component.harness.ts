import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLoader,
  HarnessPredicate
} from '@angular/cdk/testing'
import {
  MatButtonHarness
} from '@angular/material/button/testing'
import {
  MatDialogHarness
} from '@angular/material/dialog/testing'
import {
  MatIconHarness
} from '@angular/material/icon/testing'
import {
  MatMenuItemHarness
} from '@angular/material/menu/testing'
import {
  MatTableHarness,
  MatRowHarness
} from '@angular/material/table/testing'
import {
  MessageActions,
  MessageType
} from './interfaces'

interface ancestorHarnessConfig<T extends ComponentHarness> {
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
      throw new Error('root loader was not initialized')
    }
    return this.rootLoader
  }

  // TODO: convert to private once ancestorSelector is managed centrally via getCssSelector (not passed to it)
  protected ancestorSelector: string = ''
  protected ancestorHarnessConfig?: ancestorHarnessConfig<MatRowHarness>

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

  protected async updateAncestorSelector(): Promise<void> {
    if (this.ancestorHarnessConfig) {
      const harness = await this.locatorFor(this.ancestorHarnessConfig.itemHarnessPredicate)()
      const host = await harness.host()
      const hostId = await host.getAttribute(this.idAttribute)
      if (!hostId) {
        throw new Error(`Cannot execute the method: the host element of the harness returned by the wrapper does not have ${this.idAttribute} property`)
      }
      this.ancestorSelector = `${this.ancestorHarnessConfig.itemTag}${this.getIdSelector(hostId)} `
    }
  }

  /********************************
   * WRAPPERS
   *******************************/
  // +
  public inElement(id: string): this {
    const copy = Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this)
    ) as this
    copy.ancestorSelector = `div${this.getIdSelector(id)} `
    return copy
  }

  public inMatTableRow(tableId: string, rowFilter: Record<string, string>): this {
    const copy = Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this)
    ) as this
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

  // for interaction within an open mat dialog
  public async matDialogHarness<T extends BaseHarness>(dialogId: string, harness: ComponentHarnessConstructor<T>): Promise<T> {
    const matDialog = await this.getRootLoader().getHarness(MatDialogHarness.with({
      selector: `#${dialogId}`
    }))
    return await matDialog.getHarness(harness)
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
    const element = await this.locatorFor(`${cssSelectorDisabable},${cssSelectorRegular}`)()
    return await element.click()
  }

  public async selectMatMenuItem(text: string): Promise<void> {
    const matMenuItem = await this.getRootLoader().getHarness(MatMenuItemHarness.with({
      text: text
    }))
    await matMenuItem.click()
  }

  // +
  public async messageBoxClick(action: MessageActions): Promise<void> {
    const messageBox = await this.getRootLoader().getHarness(MatDialogHarness)
    const button = await messageBox.getHarness(MatButtonHarness.with({
      selector: `${this.getIdSelector(`${action}Button`)}`
    }))
    await button.click()
  }

  // +
  public async enterValue(id: string, value: string, blur: boolean = true): Promise<void> {
    const cssSelector = this.getCssSelector(id, [
      'input',
      'textarea'
    ])
    const input = await this.locatorFor(cssSelector)()
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

  /********************************
   * ASSERTIONS
   *******************************/
  // +
  public async elementVisible(id: string): Promise<boolean> {
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
    const element = await this.locatorForOptional(cssSelector)()
    if (element) {
      const display = await element.getCssValue('display')
      const visibility = await element.getCssValue('visibility')
      return display !== 'none' && visibility !== 'hidden'
    }
    else {
      return false
    }
  }

  // +
  public async elementText(id: string): Promise<string> {
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
    const element = await this.locatorFor(cssSelector)()
    return await element.text()
  }

  // +
  public async elementHasClass(id: string, cssClass: string): Promise<boolean> {
    await this.updateAncestorSelector()
    const cssSelector = this.getCssSelector(id, [
      'mat-toolbar',
      'button'
    ], this.ancestorSelector)
    const element = await this.locatorFor(cssSelector)()
    return await element.hasClass(cssClass)
  }

  public async matButtonText(id: string): Promise<string> {
    const matButton = await this.locatorFor(MatButtonHarness.with({
      selector: `${this.getIdSelector(id)}`
    }))()
    const matButtonIcon = await matButton.getHarnessOrNull(MatIconHarness)
    const matButtonText = await matButton.getText()
    const matButtonIconText = await matButtonIcon?.getName() || ''
    return matButtonText.replace(matButtonIconText, '').trim()
  }

  public async elementChildCount(id: string): Promise<number> {
    const supportedTags = [
      'div',
      'mat-dialog-actions'
    ]
    // we need to retrieve the parent first to make sure it exists
    const cssSelectorParent = this.getCssSelector(id, supportedTags, this.ancestorSelector)
    await this.locatorFor(cssSelectorParent)()
    const cssSelectorChildren = this.getCssSelector(id, supportedTags, this.ancestorSelector, ' > *')
    const children = await this.locatorForAll(cssSelectorChildren)()
    return children.length
  }

  // +
  public async buttonEnabled(id: string): Promise<boolean> {
    const button = await this.locatorFor(`button${this.getIdSelector(id)}`)()
    return !(await button.getProperty('disabled'))
  }

  // +
  public async inputValue(id: string): Promise<string> {
    const cssSelector = this.getCssSelector(id, [
      'input',
      'textarea'
    ])
    const input = await this.locatorFor(cssSelector)()
    return await input.getProperty('value')
  }

  public async matTableNRows(id: string): Promise<number> {
    const matTable = await this.locatorFor(MatTableHarness.with({
      selector: this.getIdSelector(id)
    }))()
    const rows = await matTable.getRows()
    return rows.length
  }

  public async matDialogPresent(dialogId: string): Promise<boolean> {
    const matDialog = await this.getRootLoader().getHarnessOrNull(MatDialogHarness.with({
      selector: `#${dialogId}`
    }))
    return !!matDialog
  }

  // +
  public async messageBoxPresent(type: MessageType, message?: string): Promise<boolean> {
    const messageBox = await this.getRootLoader().getHarnessOrNull(MatDialogHarness.with({
      selector: `#${type}MessageBox`
    }).addOption('message', message, async (harness, message): Promise<boolean> => {
      const actualMessage = await harness.getContentText()
      return actualMessage === message
    }))
    return !!messageBox
  }
}
