import { ViewElement } from "../../core/index.js"

export interface TransferChangeDetail {
  readonly value: readonly string[]
}

/**
 * Double-column transfer component for moving items between source and target lists.
 * @region {"name":"source","accepts":["select","options","content"],"min":0,"max":1}
 * @region {"name":"target","accepts":["select","options","content"],"min":0,"max":1}
 * @region {"name":"content","accepts":["flow content"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"Array"}}
 */
export class Transfer extends ViewElement {
  public static readonly tag = "m-transfer"
  public static readonly observedAttributes = ["source-title", "target-title", "disabled"]

  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-transfer")
    this.dataset.mTransfer = ""
    this.render()
    this.setupListeners()
    this.syncTitles()
    this.syncDisabled()
    this.updateCounts()
  }

  public disconnectedCallback(): void {
    this.cleanupListeners()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === "source-title" || name === "target-title") {
      this.syncTitles()
    } else if (name === "disabled") {
      this.syncDisabled()
    }
  }

  public get sourceTitle(): string {
    return this.getAttribute("source-title") ?? ""
  }
  public set sourceTitle(value: string | null) {
    this.setStringAttribute("source-title", value)
  }

  public get targetTitle(): string {
    return this.getAttribute("target-title") ?? ""
  }
  public set targetTitle(value: string | null) {
    this.setStringAttribute("target-title", value)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  private optionsData: readonly { label: string; value: string }[] = []
  private selectedValues: string[] = []
  private pendingSource = ""
  private pendingTarget = ""

  public get options(): readonly { label: string; value: string }[] {
    return this.optionsData
  }
  public set options(value: readonly { label: string; value: string }[]) {
    this.optionsData = Array.isArray(value) ? value : []
    this.renderOptionsMode()
  }

  public get value(): string[] {
    const targetSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-target]")
    if (targetSelect) {
      return [...targetSelect.options].map(opt => opt.value)
    }
    return [...this.selectedValues]
  }
  public set value(value: readonly string[]) {
    this.selectedValues = Array.isArray(value) ? [...value] : []
    if (this.optionsData.length > 0) {
      this.renderOptionsMode()
    }
  }

  private renderOptionsMode(): void {
    if (!this.isConnected || this.optionsData.length === 0) return
    const selected = new Set(this.selectedValues)
    const source = this.optionsData.filter((opt) => !selected.has(opt.value))
    const target = this.optionsData.filter((opt) => selected.has(opt.value))

    const renderList = (opts: readonly { label: string; value: string }[], isTarget: boolean) => {
      const list = this.ownerDocument.createElement("div")
      list.dataset.mTransferList = ""
      opts.forEach((opt) => {
        const button = this.ownerDocument.createElement("button")
        button.type = "button"
        button.textContent = opt.label
        const isSelected = (isTarget ? this.pendingTarget : this.pendingSource) === opt.value
        button.toggleAttribute("selected", isSelected)
        button.addEventListener("click", () => {
          if (isTarget) this.pendingTarget = opt.value
          else this.pendingSource = opt.value
          this.renderOptionsMode()
        })
        list.append(button)
      })
      return list
    }

    const actions = this.ownerDocument.createElement("div")
    actions.dataset.mTransferActions = ""
    const add = this.ownerDocument.createElement("button")
    add.type = "button"
    add.textContent = "›"
    add.setAttribute("aria-label", "Move to selected")
    add.addEventListener("click", () => {
      if (this.pendingSource) {
        this.selectedValues = [...new Set([...this.selectedValues, this.pendingSource])]
        this.pendingSource = ""
        this.renderOptionsMode()
        this.emit<TransferChangeDetail>("m:change", { value: this.value }, { bubbles: true, cancelable: false, composed: false })
      }
    })
    const remove = this.ownerDocument.createElement("button")
    remove.type = "button"
    remove.textContent = "‹"
    remove.setAttribute("aria-label", "Remove from selected")
    remove.addEventListener("click", () => {
      if (this.pendingTarget) {
        this.selectedValues = this.selectedValues.filter(v => v !== this.pendingTarget)
        this.pendingTarget = ""
        this.renderOptionsMode()
        this.emit<TransferChangeDetail>("m:change", { value: this.value }, { bubbles: true, cancelable: false, composed: false })
      }
    })
    actions.append(add, remove)

    this.replaceChildren(renderList(source, false), actions, renderList(target, true))
  }

  public moveToTarget(keys?: readonly string[]): void {
    if (this.disabled) return
    const sourceSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-source]")
    const targetSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-target]")
    if (!sourceSelect || !targetSelect) return

    const keySet = keys ? new Set(keys) : null
    const optionsToMove = [...sourceSelect.options].filter(opt =>
      !opt.disabled && (keySet ? keySet.has(opt.value) : opt.selected)
    )
    if (optionsToMove.length === 0) return

    for (const opt of optionsToMove) {
      opt.selected = false
      targetSelect.append(opt)
    }

    this.updateCounts()
    const targetKeys = [...targetSelect.options].map(opt => opt.value)
    this.emit<TransferChangeDetail>("m:change", { value: targetKeys }, { bubbles: true, cancelable: false, composed: false })
  }

  public moveToSource(keys?: readonly string[]): void {
    if (this.disabled) return
    const sourceSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-source]")
    const targetSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-target]")
    if (!sourceSelect || !targetSelect) return

    const keySet = keys ? new Set(keys) : null
    const optionsToMove = [...targetSelect.options].filter(opt =>
      !opt.disabled && (keySet ? keySet.has(opt.value) : opt.selected)
    )
    if (optionsToMove.length === 0) return

    for (const opt of optionsToMove) {
      opt.selected = false
      sourceSelect.append(opt)
    }

    this.updateCounts()
    const targetKeys = [...targetSelect.options].map(opt => opt.value)
    this.emit<TransferChangeDetail>("m:change", { value: targetKeys }, { bubbles: true, cancelable: false, composed: false })
  }

  public moveAllToTarget(): void {
    if (this.disabled) return
    const sourceSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-source]")
    const targetSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-target]")
    if (!sourceSelect || !targetSelect) return

    const optionsToMove = [...sourceSelect.options].filter(opt => !opt.disabled && !opt.hidden)
    if (optionsToMove.length === 0) return

    for (const opt of optionsToMove) {
      opt.selected = false
      targetSelect.append(opt)
    }

    this.updateCounts()
    const targetKeys = [...targetSelect.options].map(opt => opt.value)
    this.emit<TransferChangeDetail>("m:change", { value: targetKeys }, { bubbles: true, cancelable: false, composed: false })
  }

  public moveAllToSource(): void {
    if (this.disabled) return
    const sourceSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-source]")
    const targetSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-target]")
    if (!sourceSelect || !targetSelect) return

    const optionsToMove = [...targetSelect.options].filter(opt => !opt.disabled && !opt.hidden)
    if (optionsToMove.length === 0) return

    for (const opt of optionsToMove) {
      opt.selected = false
      sourceSelect.append(opt)
    }

    this.updateCounts()
    const targetKeys = [...targetSelect.options].map(opt => opt.value)
    this.emit<TransferChangeDetail>("m:change", { value: targetKeys }, { bubbles: true, cancelable: false, composed: false })
  }

  private render(): void {
    let columns = this.querySelector<HTMLElement>("[data-transfer-columns]")
    if (!columns) {
      columns = this.ownerDocument.createElement("div")
      columns.setAttribute("data-transfer-columns", "")

      // Source pane
      const sourcePane = this.ownerDocument.createElement("div")
      sourcePane.setAttribute("data-transfer-pane", "")
      sourcePane.setAttribute("data-pane", "source")

      const sourceHeading = this.ownerDocument.createElement("h3")
      sourceHeading.setAttribute("data-transfer-title", "source")
      sourceHeading.textContent = this.sourceTitle || "Source"

      const sourceFilterLabel = this.ownerDocument.createElement("label")
      const sourceFilter = this.ownerDocument.createElement("input")
      sourceFilter.type = "search"
      sourceFilter.setAttribute("data-transfer-filter", "source")
      sourceFilter.placeholder = "Filter"
      sourceFilter.setAttribute("aria-label", "Filter source")
      sourceFilterLabel.append(sourceFilter)

      const sourceSelectLabel = this.ownerDocument.createElement("label")
      const sourceSelect = this.ownerDocument.createElement("select")
      sourceSelect.setAttribute("data-transfer-source", "")
      sourceSelect.multiple = true
      sourceSelect.size = 6
      sourceSelectLabel.append(sourceSelect)

      const sourceCount = this.ownerDocument.createElement("p")
      sourceCount.setAttribute("data-transfer-count", "source")

      sourcePane.append(sourceHeading, sourceFilterLabel, sourceSelectLabel, sourceCount)

      // Actions
      const actions = this.ownerDocument.createElement("div")
      actions.setAttribute("data-transfer-actions", "")

      const addBtn = this.ownerDocument.createElement("button")
      addBtn.type = "button"
      addBtn.setAttribute("data-transfer-action", "add")
      addBtn.setAttribute("aria-label", "Move selected to target")
      addBtn.textContent = ">"

      const removeBtn = this.ownerDocument.createElement("button")
      removeBtn.type = "button"
      removeBtn.setAttribute("data-transfer-action", "remove")
      removeBtn.setAttribute("aria-label", "Move selected to source")
      removeBtn.textContent = "<"

      const addAllBtn = this.ownerDocument.createElement("button")
      addAllBtn.type = "button"
      addAllBtn.setAttribute("data-transfer-action", "add-all")
      addAllBtn.setAttribute("aria-label", "Move all to target")
      addAllBtn.textContent = ">>"

      const removeAllBtn = this.ownerDocument.createElement("button")
      removeAllBtn.type = "button"
      removeAllBtn.setAttribute("data-transfer-action", "remove-all")
      removeAllBtn.setAttribute("aria-label", "Move all to source")
      removeAllBtn.textContent = "<<"

      actions.append(addBtn, removeBtn, addAllBtn, removeAllBtn)

      // Target pane
      const targetPane = this.ownerDocument.createElement("div")
      targetPane.setAttribute("data-transfer-pane", "")
      targetPane.setAttribute("data-pane", "target")

      const targetHeading = this.ownerDocument.createElement("h3")
      targetHeading.setAttribute("data-transfer-title", "target")
      targetHeading.textContent = this.targetTitle || "Target"

      const targetFilterLabel = this.ownerDocument.createElement("label")
      const targetFilter = this.ownerDocument.createElement("input")
      targetFilter.type = "search"
      targetFilter.setAttribute("data-transfer-filter", "target")
      targetFilter.placeholder = "Filter"
      targetFilter.setAttribute("aria-label", "Filter target")
      targetFilterLabel.append(targetFilter)

      const targetSelectLabel = this.ownerDocument.createElement("label")
      const targetSelect = this.ownerDocument.createElement("select")
      targetSelect.setAttribute("data-transfer-target", "")
      targetSelect.multiple = true
      targetSelect.size = 6
      targetSelectLabel.append(targetSelect)

      const targetCount = this.ownerDocument.createElement("p")
      targetCount.setAttribute("data-transfer-count", "target")

      targetPane.append(targetHeading, targetFilterLabel, targetSelectLabel, targetCount)

      // Move any direct <option> children into sourceSelect
      const directOptions = [...this.children].filter(
        (child): child is HTMLOptionElement => child instanceof HTMLOptionElement
      )
      for (const opt of directOptions) {
        sourceSelect.append(opt)
      }

      columns.append(sourcePane, actions, targetPane)
      this.append(columns)
    }
  }

  private syncTitles(): void {
    const sourceTitleEl = this.querySelector<HTMLElement>(
      "[data-transfer-title='source'], [data-pane='source'] > :is(h1,h2,h3,h4,h5,h6)"
    )
    if (sourceTitleEl && this.hasAttribute("source-title")) {
      sourceTitleEl.textContent = this.sourceTitle
    }
    const targetTitleEl = this.querySelector<HTMLElement>(
      "[data-transfer-title='target'], [data-pane='target'] > :is(h1,h2,h3,h4,h5,h6)"
    )
    if (targetTitleEl && this.hasAttribute("target-title")) {
      targetTitleEl.textContent = this.targetTitle
    }
  }

  private syncDisabled(): void {
    const disabled = this.disabled
    const controls = this.querySelectorAll<HTMLSelectElement | HTMLInputElement | HTMLButtonElement>(
      "select[data-transfer-source], select[data-transfer-target], input[data-transfer-filter], button[data-transfer-action]"
    )
    for (const ctrl of controls) {
      ctrl.disabled = disabled
    }
  }

  private updateCounts(): void {
    const sourceSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-source]")
    const targetSelect = this.querySelector<HTMLSelectElement>("select[data-transfer-target]")
    const sourceCount = this.querySelector<HTMLElement>("[data-transfer-count='source']")
    const targetCount = this.querySelector<HTMLElement>("[data-transfer-count='target']")
    if (sourceSelect && sourceCount) {
      sourceCount.textContent = `${sourceSelect.options.length} items`
    }
    if (targetSelect && targetCount) {
      targetCount.textContent = `${targetSelect.options.length} items`
    }
  }

  private onActionClick = (event: MouseEvent): void => {
    if (this.disabled) return
    const target = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("button[data-transfer-action]")
    if (!target || !this.contains(target)) return

    const action = target.getAttribute("data-transfer-action")
    if (action === "add") {
      this.moveToTarget()
    } else if (action === "remove") {
      this.moveToSource()
    } else if (action === "add-all") {
      this.moveAllToTarget()
    } else if (action === "remove-all") {
      this.moveAllToSource()
    }
  }

  private onFilterInput = (event: Event): void => {
    const target = event.target as HTMLElement | null
    if (!(target instanceof HTMLInputElement)) return
    const filterType = target.getAttribute("data-transfer-filter")
    if (!filterType) return

    const query = target.value.trim().toLowerCase()
    const select = this.querySelector<HTMLSelectElement>(
      filterType === "source" ? "select[data-transfer-source]" : "select[data-transfer-target]"
    )
    if (!select) return

    for (const opt of select.options) {
      const match = !query || opt.text.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query)
      opt.hidden = !match
    }
  }

  private setupListeners(): void {
    this.addEventListener("click", this.onActionClick)
    this.addEventListener("input", this.onFilterInput)
  }

  private cleanupListeners(): void {
    this.removeEventListener("click", this.onActionClick)
    this.removeEventListener("input", this.onFilterInput)
  }
}

export { Transfer as MTransfer }
