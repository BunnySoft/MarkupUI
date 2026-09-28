import { ViewElement } from "../../core/index.js"
import { createDynamicInput, validateBounds } from "./dynamic-input.js"
import type { DynamicInputController, DynamicInputOptions, DynamicInputRow } from "./dynamic-input.js"

function rowTemplate(document: Document, nodes: Node[]): HTMLTemplateElement {
  const template = document.createElement("template"), row = document.createElement("div"), fields = document.createElement("div")
  row.className = "m-dynamic-input__row"
  row.dataset.dynamicRow = ""
  fields.className = "m-dynamic-input__fields"
  if (nodes.length === 1) fields.dataset.single = ""
  fields.append(...nodes)
  row.append(fields)
  template.content.append(row)
  template.dataset.dynamicTemplate = ""
  return template
}

/**
 * Reusable row content, mapped to an inert native template by the Web renderer.
 * @region {"name":"content","accepts":["m-* row content"],"min":1,"max":null}
 */
export class DynamicInputTemplate extends ViewElement {
  public static readonly tag = "m-dynamic-input-template"
  private template: HTMLTemplateElement | undefined

  public connectedCallback(): void {
    queueMicrotask(() => { if (this.isConnected) void this.native })
  }

  /** Web interoperability: inert content, never a live form participant. */
  public get native(): HTMLTemplateElement {
    if (!this.template) {
      if (!this.children.length) throw new TypeError("Author row content inside DynamicInputTemplate.")
      const template = rowTemplate(this.ownerDocument, [...this.childNodes])
      this.template = template
      this.append(template)
    }
    return this.template
  }
}

/**
 * Repeating fields with one collection behavior owner and stable row keys.
 * @region {"name":"template","accepts":["DynamicInputTemplate"],"min":0,"max":1}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"type":"string","row":"DynamicInputRow","index":"number","previousIndex":"number | null","rows":"readonly DynamicInputRow[]"}}
 * @event {"name":"Error","web":"m:dynamic-input-error","bubbles":false,"cancelable":false,"composed":false,"detail":{"error":"unknown","operation":"string","committed":"boolean"}}
 */
export class DynamicInput extends ViewElement {
  public static readonly tag = "m-dynamic-input"
  public static readonly observedAttributes = ["min", "max", "disabled", "name", "field-label"]

  private upgraded = false
  private controller: DynamicInputController | undefined
  private fieldset: HTMLFieldSetElement | undefined
  private template: HTMLTemplateElement | undefined
  private initializer: DynamicInputOptions["initialize"]
  private connector: DynamicInputOptions["connect"]
  private starting = false
  private generation = 0

  public connectedCallback(): void {
    const generation = ++this.generation
    queueMicrotask(() => {
      if (this.isConnected && this.generation === generation && !this.connected) this.start()
    })
  }
  public disconnectedCallback(): void {
    this.generation++
    this.controller?.disconnect()
  }
  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || !this.connected || this.starting) return
    if (name === "disabled") this.fieldset!.disabled = this.disabled
    else if (name === "name" || name === "field-label") this.syncFields()
    else if (this.controller!.min !== this.min || this.controller!.max !== this.max) this.controller!.setBounds(this.min, this.max)
  }

  /** Minimum retained rows. Initial generated rows use the same add transaction.
   * @min 0 @max 100 @integer
   */
  public get min(): number {
    const min = this.numberAttribute("min", 0)
    validateBounds(min, this.numberAttribute("max", 20))
    return min
  }
  public set min(value: number) { this.setBound("min", value) }
  /** @min 1 @max 100 @integer */
  public get max(): number {
    const max = this.numberAttribute("max", 20)
    validateBounds(this.numberAttribute("min", 0), max)
    return max
  }
  public set max(value: number) { this.setBound("max", value) }
  private setBound(name: "min" | "max", value: number): void {
    const min = name === "min" ? value : this.numberAttribute("min", 0), max = name === "max" ? value : this.numberAttribute("max", 20)
    validateBounds(min, max)
    if (this.connected) this.controller!.setBounds(min, max)
    this.setAttribute(name, String(value))
  }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  /** Submission name for the default field; custom template controls own their names. */
  public get name(): string { return this.getAttribute("name") ?? "items[]" }
  public set name(value: string) {
    if (typeof value !== "string") throw new TypeError("Use a string field name.")
    this.setAttribute("name", value)
  }
  public get fieldLabel(): string {
    const value = this.getAttribute("field-label") ?? "Item"
    if (!value.trim()) throw new TypeError("Use a nonblank field label.")
    return this.getAttribute("field-label") ?? "Item"
  }
  public set fieldLabel(value: string) {
    if (typeof value !== "string" || !value.trim()) throw new TypeError("Use a nonblank field label.")
    this.setAttribute("field-label", value)
  }
  /** Web-only synchronous detached-row hook. Register disposal with context.onCleanup. */
  public get initializeRow(): DynamicInputOptions["initialize"] { return this.initializer }
  public set initializeRow(value: DynamicInputOptions["initialize"]) {
    if (value !== undefined && typeof value !== "function") throw new TypeError("Row hooks must be synchronous functions.")
    this.initializer = value
  }
  /** Web-only synchronous connected-row hook, rerun on reconnect. */
  public get connectRow(): DynamicInputOptions["connect"] { return this.connector }
  public set connectRow(value: DynamicInputOptions["connect"]) {
    if (value !== undefined && typeof value !== "function") throw new TypeError("Row hooks must be synchronous functions.")
    this.connector = value
  }
  /** Stable keys; element references are Web-only. No lossy flattening of row values. */
  public get rows(): readonly DynamicInputRow[] { return this.controller?.rows ?? [] }
  public get connected(): boolean { return this.controller?.connected ?? false }
  public get error(): unknown { return this.controller?.error ?? null }
  /** Programmatic transactions remain available while native user interaction is disabled. */
  public add(index?: number): DynamicInputRow | null { return this.requireController().add(index) }
  public removeRow(key: string): boolean { return this.requireController().remove(key) }
  public move(key: string, index: number): boolean { return this.requireController().move(key, index) }
  public refresh(): void { this.requireController().refresh() }
  public override focus(options?: FocusOptions): void {
    if (this.isConnected) this.requireController()
    this.querySelector<HTMLElement>("input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled)")?.focus(options)
  }
  public override blur(): void {
    const active = this.ownerDocument.activeElement
    if (active instanceof HTMLElement && this.contains(active)) active.blur()
  }

  private requireController(): DynamicInputController {
    if (!this.controller && this.isConnected && !this.starting) this.start()
    if (!this.connected || this.starting) throw new Error("Dynamic Input is disconnected or initializing.")
    return this.controller!
  }
  private own<T extends HTMLElement>(selector: string): T[] {
    return [...this.querySelectorAll<T>(selector)].filter(node => node.closest("m-dynamic-input, [data-dynamic-input]") === this)
  }
  private start(): void {
    if (this.starting) throw new Error("Do not reenter Dynamic Input initialization.")
    this.generation++
    this.starting = true
    try {
      if (!this.upgraded) { this.upgradeProperties(); this.upgraded = true }
      const min = this.min, max = this.max
      this.classList.add("m-dynamic-input")
      this.dataset.dynamicInput = ""
      const fresh = !this.fieldset && !this.own("[data-dynamic-rows]").length
      this.ensureStructure()
      this.fieldset!.disabled = this.disabled
      this.syncFields()
      this.controller = createDynamicInput(this, {
        min: fresh ? 0 : min, max,
        initialize: (row, context) => {
          this.ownerDocument.defaultView!.customElements.upgrade(row)
          // Materialize selected native field owners before validation or insertion.
          for (const field of [row, ...row.querySelectorAll<HTMLElement>("*")]) {
            if (!field.matches("m-input,m-textarea,m-checkbox,m-radio,m-radio-button,m-switch,m-input-number,m-select")) continue
            if (!("native" in field)) throw new TypeError("Load template field families before Dynamic Input.")
            void (field as HTMLElement & { readonly native: HTMLElement }).native
          }
          return this.initializer?.(row, context)
        },
        connect: (row, context) => this.connector?.(row, context),
      })
      if (fresh) {
        while (this.rows.length < min) this.controller.add()
        this.controller.setBounds(min, max)
      }
    } catch (error) {
      this.controller?.disconnect()
      throw error
    } finally { this.starting = false }
  }
  private syncFields(): void {
    for (const field of [...this.own<HTMLInputElement>("[data-dynamic-field]"), ...this.template!.content.querySelectorAll<HTMLInputElement>("[data-dynamic-field]")]) {
      field.name = this.name
      field.setAttribute("aria-label", this.fieldLabel)
    }
  }
  private button(action: string): HTMLButtonElement {
    const button = this.ownerDocument.createElement("button")
    Object.assign(button, { type: "button", hidden: true, textContent: action[0]!.toUpperCase() + action.slice(1) })
    button.dataset.dynamicAction = action
    return button
  }
  private ensureStructure(): void {
    if (this.fieldset) return
    const document = this.ownerDocument
    const regions = this.own<DynamicInputTemplate>("m-dynamic-input-template")
    if (regions.length > 1) throw new TypeError("Use at most one DynamicInputTemplate.")
    let template = regions[0]?.native ?? this.own<HTMLTemplateElement>("template[data-dynamic-template]")[0]
    if (!template) {
      const input = document.createElement("input")
      input.type = "text"
      input.dataset.dynamicField = ""
      template = rowTemplate(document, [input])
      this.append(template)
    }
    if (regions.length || template.content.querySelector("[data-dynamic-field]")) {
      const actions = document.createElement("div")
      actions.className = "m-dynamic-input__actions"
      actions.append(...["up", "down", "add", "remove"].map(action => this.button(action)))
      template.content.firstElementChild!.append(actions)
    }
    this.template = template
    if (!this.own("[data-dynamic-rows]").length) {
      const rows = document.createElement("div")
      rows.className = "m-dynamic-input__rows"
      rows.dataset.dynamicRows = ""
      this.prepend(rows)
    }
    if (!this.own("[data-dynamic-add]").length) {
      const button = this.button("add")
      delete button.dataset.dynamicAction
      button.dataset.dynamicAdd = ""
      this.append(button)
    }
    // Native inherited disabling preserves authored flags and nested collections.
    const fieldset = document.createElement("fieldset")
    fieldset.className = "m-dynamic-input__controls"
    fieldset.append(...this.childNodes)
    this.append(fieldset)
    this.fieldset = fieldset
  }
}
