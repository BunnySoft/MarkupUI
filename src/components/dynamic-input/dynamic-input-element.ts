import { ViewElement } from "../../core/index.js"

export interface DynamicInputChangeDetail {
  value: string[]
}

/**
 * DynamicInput component for repeating authored native rows with bounds and actions.
 * @region {"name":"content","accepts":["container","template","button"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"Array"}}
 */
export class DynamicInput extends ViewElement {
  public static readonly tag = "m-dynamic-input"
  public static readonly observedAttributes = ["min", "max", "disabled"]

  private initialized = false
  private sequence = 0

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-dynamic-input")
    this.render()
    this.addEventListener("click", this.onClick)
    this.addEventListener("change", this.onChange)
    this.syncActions()
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.onClick)
    this.removeEventListener("change", this.onChange)
  }

  public attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null): void {
    if (this.initialized && this.isConnected) {
      this.syncActions()
    }
  }

  public get min(): number {
    return this.numberAttribute("min", 0)
  }

  public set min(value: number) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      throw new RangeError("Invalid min.")
    }
    this.setAttribute("min", String(value))
    if (this.initialized && this.isConnected) this.syncActions()
  }

  public get max(): number {
    return this.numberAttribute("max", 20)
  }

  public set max(value: number) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
      throw new RangeError("Invalid max.")
    }
    this.setAttribute("max", String(value))
    if (this.initialized && this.isConnected) this.syncActions()
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.initialized && this.isConnected) this.syncActions()
  }

  public override focus(options?: FocusOptions): void {
    const firstInput = this.querySelector<HTMLElement>("input, select, textarea, button")
    firstInput?.focus(options)
  }

  public override blur(): void {
    const active = this.ownerDocument.activeElement
    if (active && this.contains(active) && active instanceof HTMLElement) {
      active.blur()
    }
  }

  public getRows(): HTMLElement[] {
    const container = this.getContainer()
    if (!container) return []
    return [...container.children].filter(
      child => child instanceof HTMLElement && (child.hasAttribute("data-dynamic-row") || child.classList.contains("m-dynamic-input__row")),
    ) as HTMLElement[]
  }

  public getValues(): string[] {
    const rows = this.getRows()
    return rows.map(row => {
      const inputs = [...row.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select")].filter(
        node => !node.hasAttribute("data-dynamic-action"),
      )
      if (inputs.length === 1) return inputs[0]!.value
      if (inputs.length > 1) return inputs.map(i => i.value).join(", ")
      return row.textContent?.trim() ?? ""
    })
  }

  public add(index?: number): HTMLElement | null {
    return this.addRowInternal(index, true)
  }

  public override remove(): void
  public override remove(target: string | number | HTMLElement): boolean
  public override remove(target?: string | number | HTMLElement): boolean | void {
    if (target === undefined) {
      super.remove()
      return
    }
    const rows = this.getRows()
    if (rows.length <= this.min) return false

    let rowToRemove: HTMLElement | undefined
    if (typeof target === "number") {
      rowToRemove = rows[target]
    } else if (typeof target === "string") {
      rowToRemove = rows.find(r => r.getAttribute("data-dynamic-key") === target)
    } else if (target instanceof HTMLElement) {
      rowToRemove = rows.find(r => r === target || r.contains(target))
    }

    if (!rowToRemove) return false

    rowToRemove.remove()
    this.syncActions()

    this.emit<{ value: string[] }>("m:change", { value: this.getValues() }, { bubbles: true, cancelable: false, composed: false })
    return true
  }

  public move(from: string | number | HTMLElement, toIndex: number): boolean {
    const rows = this.getRows()
    if (toIndex < 0 || toIndex >= rows.length) return false

    let fromIndex = -1
    if (typeof from === "number") {
      fromIndex = from
    } else if (typeof from === "string") {
      fromIndex = rows.findIndex(r => r.getAttribute("data-dynamic-key") === from)
    } else if (from instanceof HTMLElement) {
      fromIndex = rows.findIndex(r => r === from || r.contains(from))
    }

    if (fromIndex < 0 || fromIndex >= rows.length || fromIndex === toIndex) return false

    const container = this.getContainer()
    if (!container) return false

    const row = rows[fromIndex]!
    const nextRows = [...rows]
    nextRows.splice(fromIndex, 1)
    nextRows.splice(toIndex, 0, row)

    const referenceNode = nextRows[toIndex + 1] ?? null
    container.insertBefore(row, referenceNode)

    this.syncActions()
    this.emit<{ value: string[] }>("m:change", { value: this.getValues() }, { bubbles: true, cancelable: false, composed: false })
    return true
  }

  public syncActions(): void {
    const rows = this.getRows()
    const isDis = this.disabled
    const atMax = rows.length >= this.max
    const atMin = rows.length <= this.min

    const globalAddBtn = this.getAddButton()
    if (globalAddBtn) {
      globalAddBtn.disabled = isDis || atMax
      globalAddBtn.hidden = false
    }

    rows.forEach((row, index) => {
      for (const btn of row.querySelectorAll<HTMLButtonElement>("[data-dynamic-action]")) {
        btn.hidden = false
        const action = btn.getAttribute("data-dynamic-action")
        if (action === "up") {
          btn.disabled = isDis || index === 0
        } else if (action === "down") {
          btn.disabled = isDis || index === rows.length - 1
        } else if (action === "add") {
          btn.disabled = isDis || atMax
        } else if (action === "remove") {
          btn.disabled = isDis || atMin
        }
      }

      for (const input of row.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select")) {
        if (!input.hasAttribute("data-dynamic-action")) {
          input.disabled = isDis
        }
      }
    })
  }

  public refresh(): void {
    this.syncActions()
  }

  private getContainer(): HTMLElement | null {
    return (
      this.querySelector<HTMLElement>(":scope > [data-dynamic-rows]") ??
      this.querySelector<HTMLElement>(":scope > .m-dynamic-input__rows") ??
      this.querySelector<HTMLElement>("[data-dynamic-rows]")
    )
  }

  private getTemplate(): HTMLTemplateElement | null {
    return (
      this.querySelector<HTMLTemplateElement>(":scope > template[data-dynamic-template]") ??
      this.querySelector<HTMLTemplateElement>(":scope > template") ??
      this.querySelector<HTMLTemplateElement>("template")
    )
  }

  private getAddButton(): HTMLButtonElement | null {
    return (
      this.querySelector<HTMLButtonElement>(":scope > [data-dynamic-add]") ??
      this.querySelector<HTMLButtonElement>("[data-dynamic-add]")
    )
  }

  private addRowInternal(index?: number, shouldEmit = true): HTMLElement | null {
    const rows = this.getRows()
    if (rows.length >= this.max) return null

    const container = this.getContainer()
    const template = this.getTemplate()
    if (!container || !template) return null

    const fragment = this.ownerDocument.importNode(template.content, true)
    const row = fragment.firstElementChild as HTMLElement
    if (!row) return null

    if (!row.hasAttribute("data-dynamic-key")) {
      row.setAttribute("data-dynamic-key", `row-${++this.sequence}`)
    }
    for (const btn of row.querySelectorAll<HTMLButtonElement>("[data-dynamic-action]")) {
      btn.hidden = false
    }

    const insertIndex = index !== undefined ? Math.max(0, Math.min(index, rows.length)) : rows.length
    const referenceNode = rows[insertIndex] ?? null
    container.insertBefore(row, referenceNode)

    this.syncActions()

    if (shouldEmit) {
      this.emit<{ value: string[] }>("m:change", { value: this.getValues() }, { bubbles: true, cancelable: false, composed: false })
    }
    return row
  }

  private render(): void {
    let container = this.getContainer()
    if (!container) {
      container = this.ownerDocument.createElement("div")
      container.className = "m-dynamic-input__rows"
      container.setAttribute("data-dynamic-rows", "")
      this.append(container)
    }

    let template = this.getTemplate()
    if (!template) {
      template = this.ownerDocument.createElement("template")
      template.setAttribute("data-dynamic-template", "")
      const row = this.ownerDocument.createElement("div")
      row.className = "m-dynamic-input__row"
      row.setAttribute("data-dynamic-row", "")

      const fields = this.ownerDocument.createElement("div")
      fields.className = "m-dynamic-input__fields"
      const input = this.ownerDocument.createElement("input")
      input.type = "text"
      fields.append(input)

      const actions = this.ownerDocument.createElement("div")
      actions.className = "m-dynamic-input__actions"

      const upBtn = this.ownerDocument.createElement("button")
      upBtn.type = "button"
      upBtn.setAttribute("data-dynamic-action", "up")
      upBtn.textContent = "Up"

      const downBtn = this.ownerDocument.createElement("button")
      downBtn.type = "button"
      downBtn.setAttribute("data-dynamic-action", "down")
      downBtn.textContent = "Down"

      const addBtn = this.ownerDocument.createElement("button")
      addBtn.type = "button"
      addBtn.setAttribute("data-dynamic-action", "add")
      addBtn.textContent = "Add"

      const removeBtn = this.ownerDocument.createElement("button")
      removeBtn.type = "button"
      removeBtn.setAttribute("data-dynamic-action", "remove")
      removeBtn.textContent = "Remove"

      actions.append(upBtn, downBtn, addBtn, removeBtn)
      row.append(fields, actions)
      template.content.append(row)
      this.append(template)
    }

    let addBtn = this.getAddButton()
    if (!addBtn) {
      addBtn = this.ownerDocument.createElement("button")
      addBtn.type = "button"
      addBtn.setAttribute("data-dynamic-add", "")
      addBtn.textContent = "Add"
      this.append(addBtn)
    }

    const rows = this.getRows()
    const targetMin = this.min
    if (rows.length < targetMin) {
      for (let i = rows.length; i < targetMin; i++) {
        this.addRowInternal(rows.length, false)
      }
    }
  }

  private onClick = (event: Event): void => {
    const target = event.target as HTMLElement | null
    if (!target || this.disabled) return

    const addGlobal = target.closest<HTMLButtonElement>("[data-dynamic-add]")
    if (addGlobal && (addGlobal.closest("m-dynamic-input") as unknown) === this) {
      event.preventDefault()
      this.add()
      return
    }

    const actionBtn = target.closest<HTMLButtonElement>("[data-dynamic-action]")
    if (actionBtn && (actionBtn.closest("m-dynamic-input") as unknown) === this) {
      const row = actionBtn.closest<HTMLElement>("[data-dynamic-row], .m-dynamic-input__row")
      if (!row || !this.contains(row)) return
      event.preventDefault()
      const action = actionBtn.getAttribute("data-dynamic-action")
      const rows = this.getRows()
      const index = rows.indexOf(row)
      if (action === "add") {
        this.add(index + 1)
      } else if (action === "remove") {
        this.remove(row)
      } else if (action === "up") {
        this.move(index, index - 1)
      } else if (action === "down") {
        this.move(index, index + 1)
      }
    }
  }

  private onChange = (event: Event): void => {
    const target = event.target as HTMLElement | null
    if (target && (target as unknown) !== this && (target.closest("m-dynamic-input") as unknown) === this) {
      if (target.matches("input, textarea, select")) {
        this.emit<{ value: string[] }>("m:change", { value: this.getValues() }, { bubbles: true, cancelable: false, composed: false })
      }
    }
  }
}
