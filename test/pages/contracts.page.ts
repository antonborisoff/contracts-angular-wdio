import {
  WaitingHarness
} from '../utils/waiting.component.harness.js'
import {
  Utils
} from '../utils/utils.js'
import {
  MessageActions
} from '../utils/interfaces.js'

// we use harness as lookup scope limiting view
// this is also where we define custom local methods
class ContractsHarness extends WaitingHarness {
  public static hostSelector = 'app-contracts'
}

class ContractHarness extends WaitingHarness {
  public static hostSelector = 'app-contract'
}

export class ContractsPage {
  static #contractListContainerId = 'dataContainer'

  static #addContractButtonId = 'addContractButton'
  static #createEditFormContainerId = 'createEditFormContainer'
  static #contractNumberInputId = 'numberInput'
  static #contractConditionsInputId = 'conditionsInput'
  static #saveContractButtonId = 'saveContractButton'

  static #searchInputId = 'contractSearchInput'
  static #listId = 'contractList'
  static #contractNumberTextId = 'contractNumber'
  static #contractConditionsTextId = 'contractConditions'
  static #editContractButtonId = 'editContract'
  static #deleteContractButtonId = 'deleteContract'

  /*******************************************
   * ACTIONS
   ******************************************/

  public static async iCreateContract(contract: {
    number: string
    conditions: string
  }): Promise<void> {
    const listHarness = await Utils.waitForHarness(ContractsHarness)
    await listHarness.expectElementFree(this.#contractListContainerId)
    await listHarness.clickElement(this.#addContractButtonId)

    const contractHarness = await Utils.waitForHarness(ContractHarness)
    await contractHarness.expectElementFree(this.#createEditFormContainerId)
    await contractHarness.enterValue(this.#contractNumberInputId, contract.number)
    await contractHarness.enterValue(this.#contractConditionsInputId, contract.conditions)
    await contractHarness.clickElement(this.#saveContractButtonId)
    // wait for operation completion
    await Utils.waitForPageLeft(ContractHarness)
  }

  public static async iEditContract(contract: {
    number: string
  }, attributesToUpdate: {
    number?: string
    conditions?: string
  }): Promise<void> {
    const recordIdentifier = {
      number: contract.number
    }
    const listHarness = await Utils.waitForHarness(ContractsHarness)
    await listHarness.expectElementFree(this.#contractListContainerId)
    await listHarness.inMatTableRow(this.#listId, recordIdentifier).clickElement(this.#editContractButtonId)

    const contractHarness = await Utils.waitForHarness(ContractHarness)
    await contractHarness.expectElementFree(this.#createEditFormContainerId)
    if (attributesToUpdate.number !== undefined) {
      await contractHarness.enterValue(this.#contractNumberInputId, attributesToUpdate.number)
    }
    if (attributesToUpdate.conditions !== undefined) {
      await contractHarness.enterValue(this.#contractConditionsInputId, attributesToUpdate.conditions)
    }
    await contractHarness.clickElement(this.#saveContractButtonId)
    // wait for operation completion
    await Utils.waitForPageLeft(ContractHarness)
  }

  public static async iDeleteContract(contract: {
    number: string
  }): Promise<void> {
    const recordIdentifier = {
      number: contract.number
    }
    const listHarness = await Utils.waitForHarness(ContractsHarness)
    await listHarness.expectElementFree(this.#contractListContainerId)
    await listHarness.inMatTableRow(this.#listId, recordIdentifier).clickElement(this.#deleteContractButtonId)
    await listHarness.messageBoxClick(MessageActions.CONFIRM)
    // wait for operation completion
    await listHarness.expectElementFree(this.#contractListContainerId)
  }

  public static async iSearchContract(searchTerm: string): Promise<void> {
    const harness = await Utils.waitForHarness(ContractsHarness)
    await harness.expectElementFree(this.#contractListContainerId)
    await harness.enterValue(this.#searchInputId, searchTerm)
  }
  /*******************************************
   * ASSERTIONS
   ******************************************/

  public static async iShouldSeeContract(contract: {
    number: string
    conditions: string
  }): Promise<void> {
    const recordIdentifier = {
      number: contract.number
    }
    const harness = await Utils.waitForHarness(ContractsHarness)
    await harness.expectElementFree(this.#contractListContainerId)
    await harness.inMatTableRow(this.#listId, recordIdentifier).expectElementText(this.#contractNumberTextId, contract.number)
    await harness.inMatTableRow(this.#listId, recordIdentifier).expectElementText(this.#contractConditionsTextId, contract.conditions)
  }

  public static async iShouldSeeNoContracts(): Promise<void> {
    const harness = await Utils.waitForHarness(ContractsHarness)
    await harness.expectElementFree(this.#contractListContainerId)
    await harness.expectMatTableNRows(this.#listId, 0)
  }
}
