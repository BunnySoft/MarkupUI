import { ViewElement } from "../../core/index.js"
import { createTreeSelect, treeSelectData, treeSelectKeys, treeSelectSettings } from "./tree-select.js"
import type { TreeSelectController, TreeSelectOptions, TreeSelectResume, TreeSelectSettings, TreeSelectState, TreeSelectValue } from "./tree-select.js"
import type { TreeSelectItem } from "./tree-select.js"

/**
 * Passive hierarchy data mapped to a labelled native select, without Tree registration.
 * @event {"name":"Change","web":"m:tree-select-change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Error","web":"m:tree-select-error","bubbles":true,"cancelable":false,"composed":false}
 */
export class TreeSelect extends ViewElement {
  public static readonly tag = "m-tree-select"
  public static readonly observedAttributes = ["options", "settings", "value", "default-value", "label", "name", "placeholder", "disabled", "required", "clearable", "multiple", "filterable"]
  #controller: TreeSelectController | undefined
  #initial: TreeSelectOptions = {}
  #data = treeSelectData([])
  #settings = treeSelectSettings({})
  #root: HTMLElement | undefined
  #control: HTMLSelectElement | undefined
  #resume: TreeSelectResume | undefined
  #upgraded = false
  #reflecting = false

  public connectedCallback(): void {
    if (!this.#upgraded) { this.#upgraded = true; this.upgradeProperties() }
    if (!this.#root) this.#create()
    this.#sync()
    this.#controller = createTreeSelect(this.#root!, this.#data, { ...this.#settings, ...this.#initial }, this, this.#resume)
    this.#initial = {}
  }
  public disconnectedCallback(): void {
    if (this.connected) this.#resume = this.#controller!.resume
    this.#controller?.disconnect()
  }
  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || this.#reflecting) return
    try {
      if (name === "options") this.options = JSON.parse(after ?? "[]")
      else if (name === "settings") this.settings = JSON.parse(after ?? "{}")
      else if (name === "value") this.value = this.#parse(after)
      else if (name === "default-value") this.defaultValue = this.#parse(after)
      else {
        if (this.connected && ["multiple", "filterable"].includes(name)) this.#mode()
        if (this.connected) { this.#sync(); this.refresh() }
      }
    } catch (error) { this.#reflect(name, before); throw error }
  }
  /** Immutable bounded data; lazy loading and cascading checks are not this contract. @default [] */
  public get options(): readonly TreeSelectItem[] { return this.#data.items }
  public set options(value: readonly TreeSelectItem[]) {
    if (this.connected) this.#controller!.assertMutable()
    const next = treeSelectData(value)
    if (this.connected) this.#controller!.setData(next)
    this.#data = next
  }
  /** Single key/null or independent dense multiple keys in native option order. Invalid arrays fail before writes. */
  public get value(): TreeSelectValue { return this.connected ? this.#controller!.value : this.#initial.value !== undefined ? this.#initial.value : this.#resume?.value ?? (this.multiple ? [] : null) }
  public set value(value: TreeSelectValue) {
    value = this.#value(value)
    if (this.connected) this.#controller!.setValue(value)
    else this.#initial.value = value
  }
  /** Independent form-reset target. Unavailable defaults are retained across reconnect. */
  public get defaultValue(): TreeSelectValue {
    const keys = this.connected ? this.state.defaultKeys : this.#resume?.defaults ?? []
    return this.#initial.defaultValue !== undefined ? this.#initial.defaultValue : this.multiple ? keys : keys[0] ?? null
  }
  public set defaultValue(value: TreeSelectValue) {
    value = this.#value(value)
    if (this.connected) this.#controller!.setDefaultValue(value)
    else this.#initial.defaultValue = value
  }
  public get label(): string { return this.getAttribute("label") ?? "Choices" }
  public set label(value: string) { this.#text(value); this.setStringAttribute("label", value) }
  public get name(): string { return this.getAttribute("name") ?? "" }
  public set name(value: string) { this.setStringAttribute("name", value) }
  public get placeholder(): string { return this.getAttribute("placeholder") ?? "Choose" }
  public set placeholder(value: string) { this.#text(value); this.setStringAttribute("placeholder", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get required(): boolean { return this.hasAttribute("required") }
  public set required(value: boolean) { this.setBooleanAttribute("required", value) }
  public get clearable(): boolean { return this.hasAttribute("clearable") }
  public set clearable(value: boolean) { this.setBooleanAttribute("clearable", value) }
  /** Disconnect before changing native selection mode. */
  public get multiple(): boolean { return this.hasAttribute("multiple") }
  public set multiple(value: boolean) { this.#mode(); this.setBooleanAttribute("multiple", value) }
  /** Filtering uses a native listbox, never a simulated dropdown. */
  public get filterable(): boolean { return this.hasAttribute("filterable") }
  public set filterable(value: boolean) { this.#mode(); this.setBooleanAttribute("filterable", value) }
  /** Selection/path policy. Disconnect before replacing configuration. */
  public get settings(): Readonly<Required<TreeSelectSettings>> { return this.#settings }
  public set settings(value: TreeSelectSettings) { this.#mode(); this.#settings = treeSelectSettings(value) }
  public get connected(): boolean { return this.#controller?.connected ?? false }
  public get state(): TreeSelectState { return this.#live().state }
  public get error(): unknown { return this.#controller?.error ?? null }
  /** Web-only native form owner. No native markup is required to configure this element. */
  public get native(): HTMLSelectElement | null { return this.#control ?? null }
  public setFilter(value: string): void { this.#live().setFilter(value) }
  public clear(): boolean { return this.#live().clear() }
  public refresh(): void { if (this.connected) this.#controller!.refresh() }
  public override focus(options?: FocusOptions): void { this.#control?.focus(options) }
  public override blur(): void { this.#control?.blur() }

  #live(): TreeSelectController { if (!this.connected) throw new Error("Tree Select is disconnected."); return this.#controller! }
  #mode(): void { if (this.connected) throw new Error("Disconnect before changing Tree Select mode.") }
  #text(value: string): void { if (typeof value !== "string" || !value.trim() || value.length > 1024) throw new TypeError("Use a nonempty label of at most 1024 characters.") }
  #parse(value: string | null): TreeSelectValue { return this.multiple ? JSON.parse(value ?? "[]") : value }
  #value(value: TreeSelectValue): TreeSelectValue {
    const keys = treeSelectKeys(value, this.multiple)
    return this.multiple ? Object.freeze(keys) : value
  }
  #reflect(name: string, value: string | null): void {
    this.#reflecting = true
    try { this.setStringAttribute(name, value) } finally { this.#reflecting = false }
  }
  #sync(): void {
    this.#text(this.label); this.#text(this.placeholder)
    const root = this.#root!, control = this.#control!, field = control.closest("[data-tree-select-field]")!
    root.setAttribute("aria-label", this.label); control.setAttribute("aria-label", this.label)
    control.name = this.name; control.disabled = this.disabled; control.required = this.required
    control.multiple = this.multiple; control.size = this.filterable || this.multiple ? 5 : 0
    let placeholder = control.querySelector<HTMLOptionElement>('option[value=""]')
    if (this.multiple) placeholder?.remove()
    else {
      if (!placeholder) { placeholder = this.ownerDocument.createElement("option"); placeholder.value = ""; control.prepend(placeholder) }
      placeholder.textContent = this.placeholder; placeholder.toggleAttribute("data-select-placeholder", !this.filterable)
    }
    root.querySelector<HTMLButtonElement>("button")!.disabled = !this.clearable || this.disabled
    let search = field.querySelector<HTMLElement>("[data-select-search]")
    if (!this.filterable) search?.remove()
    else if (!search) {
      search = this.ownerDocument.createElement("div"); search.dataset.selectSearch = ""; search.hidden = true
      const input = this.ownerDocument.createElement("input"), empty = this.ownerDocument.createElement("p")
      input.type = "search"; input.dataset.selectFilter = ""; input.setAttribute("aria-label", `Filter ${this.label}`)
      empty.dataset.selectEmpty = ""; empty.textContent = "No matches"; empty.hidden = true
      search.append(input, empty); field.append(search)
    }
  }
  #create(): void {
    const doc = this.ownerDocument
    const make = <K extends keyof HTMLElementTagNameMap>(tag: K, part: string) => {
      const node = doc.createElement(tag); node.setAttribute(`data-${part}`, ""); return node
    }
    const root = this.#root = make("section", "tree-select")
    root.className = "m-tree-select"
    const field = make("div", "tree-select-field"), control = this.#control = make("select", "select-control")
    field.className = "m-select"; field.dataset.select = ""; field.append(control)
    const readout = make("p", "tree-select-value"), status = make("p", "tree-select-status"), clear = make("button", "tree-select-clear")
    status.setAttribute("aria-live", "polite")
    clear.type = "button"; clear.textContent = "Clear"; clear.hidden = true
    root.append(field, readout, status, clear); this.append(root)
  }
}
