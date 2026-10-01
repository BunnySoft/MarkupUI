import { ViewElement } from "../../core/index.js"
import { createAutoComplete } from "./auto-complete.js"
import type { AutoCompleteController } from "./auto-complete.js"
import { autoCompleteSettings, autoCompleteSuggestions } from "./model.js"
import type { AutoCompleteLoader, AutoCompleteQueryResult, AutoCompleteSettings, AutoCompleteState, AutoCompleteSuggestion } from "./model.js"

export type AutoCompleteSize = "small" | "medium" | "large"
export const autoCompleteSizes: readonly AutoCompleteSize[] = ["small", "medium", "large"] as const
let nextId = 0

/**
 * Typed data and native Web mapping; createAutoComplete is the only behavior owner.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"NativeChange","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Invalid","web":"invalid","bubbles":false,"cancelable":true,"composed":false}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Select","web":"m:select","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Results","web":"m:auto-complete-results","bubbles":true,"cancelable":false,"composed":false,"detail":{"query":"string","suggestions":"readonly AutoCompleteSuggestion[]","result":"AutoCompleteQueryResult"}}
 * @event {"name":"Error","web":"m:auto-complete-error","bubbles":true,"cancelable":false,"composed":false,"detail":{"query":"string","error":"unknown"}}
 * @region {"name":"options","accepts":["m-option (inert suggestion data)"],"min":0,"max":null}
 * @region {"name":"content","accepts":["phrasing","native input/datalist (Web interoperability)"],"min":0,"max":null}
 * @region {"name":"status","accepts":["plain native p/span/div[data-auto-complete-status] (Web interoperability)"],"min":0,"max":1}
 */
export class AutoComplete extends ViewElement {
  public static readonly tag = "m-auto-complete"
  public static readonly observedAttributes = [
    "value", "placeholder", "disabled", "readonly", "clearable", "size", "name", "form", "required",
    "min-length", "max-results", "debounce", "aria-label", "aria-labelledby", "aria-describedby",
  ]

  #initialized = false
  #input: HTMLInputElement | null = null
  #list: HTMLDataListElement | null = null
  #status: HTMLElement | null = null
  #clearButton: HTMLButtonElement | null = null
  #controller: AutoCompleteController | null = null
  #observer: MutationObserver | null = null
  #load: AutoCompleteLoader | undefined
  #data: readonly AutoCompleteSuggestion[] | null = null
  #projectedData: readonly AutoCompleteSuggestion[] | null = null
  #pendingValue: string | undefined
  #defaultSource: string | null | undefined
  #configuration = ""
  #writes = new Map<Element, Map<string, { before: string | null; last: string | null }>>()

  public connectedCallback(): void {
    if (!this.#initialized) {
      this.upgradeProperties()
      this.#initialized = true
    }
    this.classList.add("m-auto-complete")
    this.dataset.size = this.size
    this.#prepare()
    this.#syncInput()
    this.#controller = createAutoComplete(this.#input!, { ...this.#settings(), status: this.#status!, clear: this.#clearButton! })
    if (this.#pendingValue !== undefined) {
      this.#controller.value = this.#pendingValue
      this.#pendingValue = undefined
    }
    this.#syncOptions()
    this.#observer = new MutationObserver(() => this.#syncOptions())
    this.#observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["value", "label", "disabled"] })
  }

  public disconnectedCallback(): void {
    this.#observer?.disconnect()
    this.#observer = null
    this.#controller?.disconnect()
    this.#controller = null
    for (const [node, attributes] of this.#writes) for (const [name, write] of attributes) {
      if (node.getAttribute(name) !== write.last) continue
      if (write.before === null) node.removeAttribute(name)
      else node.setAttribute(name, write.before)
    }
    this.#writes.clear()
  }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || !this.#initialized || !this.isConnected) return
    if (name === "size") this.dataset.size = this.size
    else if (["min-length", "max-results", "debounce", "clearable"].includes(name)) this.#active.configure(this.#settings())
    else {
      this.#syncInput()
      this.#controller?.refresh()
    }
  }

  /** Actual native editing value, including free text and silent native writes. Empty is ""; writes are silent and do not change reset defaults. */
  public get value(): string { return this.#control?.value ?? this.#pendingValue ?? this.getAttribute("value") ?? "" }
  public set value(value: string) {
    if (typeof value !== "string") throw new TypeError("Auto Complete value must be a string.")
    if (this.#controller) this.#active.value = value
    else if (this.#control) this.#control.value = value
    else this.#pendingValue = value
  }
  /** Native reset default; the value attribute configures this, not a mirror of live edits. Native dirty-value rules apply. */
  public get defaultValue(): string { return this.#control?.defaultValue ?? this.getAttribute("value") ?? "" }
  public set defaultValue(value: string) {
    if (typeof value !== "string") throw new TypeError("Auto Complete defaultValue must be a string.")
    if (this.#controller) this.#active.defaultValue = value
    else if (this.#control) this.#control.defaultValue = value
    if (this.#control) this.#defaultSource = value
    this.setStringAttribute("value", value)
  }
  public get placeholder(): string { return this.#control?.placeholder ?? this.getAttribute("placeholder") ?? "" }
  public set placeholder(value: string | null) { this.setStringAttribute("placeholder", value); this.#syncInput() }
  public get disabled(): boolean { return this.#control?.disabled ?? this.hasAttribute("disabled") }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.#control && this.#control.disabled !== value) { this.#control.disabled = value; this.#controller?.refresh() }
  }
  public get readOnly(): boolean { return this.#control?.readOnly ?? this.hasAttribute("readonly") }
  public set readOnly(value: boolean) {
    this.setBooleanAttribute("readonly", value)
    if (this.#control && this.#control.readOnly !== value) { this.#control.readOnly = value; this.#controller?.refresh() }
  }
  public get required(): boolean { return this.#control?.required ?? this.hasAttribute("required") }
  public set required(value: boolean) {
    this.setBooleanAttribute("required", value)
    if (this.#control && this.#control.required !== value) { this.#control.required = value; this.#controller?.refresh() }
  }
  public get name(): string { return this.#control?.name ?? this.getAttribute("name") ?? "" }
  public set name(value: string | null) { this.setStringAttribute("name", value); this.#syncInput() }
  /** External native form id; null releases the host mapping and preserves authored association. */
  public get formId(): string | null {
    if (this.#control) return this.#control.getAttribute("form")
    return this.getAttribute("form")
  }
  public set formId(value: string | null) { this.setStringAttribute("form", value); this.#syncInput() }
  public get clearable(): boolean { return this.hasAttribute("clearable") }
  public set clearable(value: boolean) { this.setBooleanAttribute("clearable", value) }
  public get size(): AutoCompleteSize { return this.choiceAttribute("size", autoCompleteSizes, "medium") }
  public set size(value: AutoCompleteSize) { this.setChoiceAttribute("size", value, autoCompleteSizes) }
  /** Property-only loader, shared with the native helper; query rejections remain observable. */
  public get load(): AutoCompleteLoader | undefined { return this.#load }
  public set load(value: AutoCompleteLoader | undefined) {
    autoCompleteSettings({ load: value })
    if (this.#controller?.connected) this.#controller.configure({ load: value })
    this.#load = value
  }
  /** Minimum query length; not native input minlength.
   * @min 0
   * @max 1000
   * @integer
   */
  public get minLength(): number { return this.numberAttribute("min-length", 1) }
  public set minLength(value: number) {
    autoCompleteSettings({ minLength: value })
    this.setAttribute("min-length", String(value))
  }
  /** Bounds loader/transient results; static configured options are not truncated.
   * @min 1
   * @max 100
   * @integer
   */
  public get maxResults(): number { return this.numberAttribute("max-results", 20) }
  public set maxResults(value: number) {
    autoCompleteSettings({ maxResults: value })
    this.setAttribute("max-results", String(value))
  }
  /** Query debounce in milliseconds.
   * @min 0
   * @max 1000
   * @integer
   */
  public get debounce(): number { return this.numberAttribute("debounce", 150) }
  public set debounce(value: number) {
    autoCompleteSettings({ debounce: value })
    this.setAttribute("debounce", String(value))
  }
  /**
   * Immutable suggestion schema: unique nonempty value, optional label and disabled.
   * Property assignment is authoritative over inert m-option configuration; it does not write the field value.
   * Unassigned native fallback snapshots retain native-permissive values and labels.
   * @default []
   */
  public get options(): readonly AutoCompleteSuggestion[] {
    return this.#data ?? this.#controller?.options ?? (this.#list ? Object.freeze([...this.#list.options]
      .map(option => Object.freeze({ value: option.value, label: option.label, disabled: option.disabled })))
      : autoCompleteSuggestions(this.#configurationData()))
  }
  public set options(value: readonly (string | AutoCompleteSuggestion)[]) {
    const next = autoCompleteSuggestions(value)
    if (this.#controller?.connected) {
      this.#controller.setOptions(next)
      this.#projectedData = next
    }
    this.#data = next
  }
  /** Stable Web semantic/editing owner; available for an authored input or after first rendering, including while detached. */
  public get native(): HTMLInputElement | null { return this.#control }
  public get datalist(): HTMLDataListElement | null { return this.#list }
  public get status(): HTMLElement | null { return this.#status }
  public get form(): HTMLFormElement | null { return this.#control?.form ?? null }
  public get validity(): ValidityState | null { return this.#control?.validity ?? null }
  public get validationMessage(): string { return this.#control?.validationMessage ?? "" }
  public get willValidate(): boolean { return this.#control?.willValidate ?? false }
  public get connected(): boolean { return this.#controller?.connected ?? false }
  public get state(): AutoCompleteState { return this.#controller?.state ?? "idle" }
  public get error(): unknown { return this.#controller?.error ?? null }

  public query(): Promise<AutoCompleteQueryResult> { return this.#active.query() }
  /** Temporary results; refresh/reset/disconnect restores configured or authored options. */
  public setSuggestions(value: readonly (string | AutoCompleteSuggestion)[]): void { this.#active.setSuggestions(value) }
  public clear(): void { this.#active.clear() }
  public refresh(): void {
    this.#syncInput()
    this.#syncOptions()
    this.#active.refresh()
  }
  public checkValidity(): boolean { return this.#native.checkValidity() }
  public reportValidity(): boolean { return this.#native.reportValidity() }
  public setCustomValidity(message: string): void {
    if (typeof message !== "string") throw new TypeError("Use a string validation message.")
    this.#native.setCustomValidity(message)
  }
  public override focus(options?: FocusOptions): void { this.#control?.focus(options) }
  public override blur(): void { this.#control?.blur() }

  get #active(): AutoCompleteController {
    if (!this.#controller?.connected) throw new Error("Auto Complete is disconnected.")
    return this.#controller
  }
  get #native(): HTMLInputElement {
    if (!this.#control) throw new Error("Render Auto Complete before using native validity.")
    return this.#control
  }
  get #control(): HTMLInputElement | null {
    if (this.#input) return this.#input
    const inputs = this.#owned<HTMLInputElement>("input")
    if (inputs.length > 1) throw new TypeError("Auto Complete accepts one native input.")
    return inputs[0] ?? null
  }
  #settings(): AutoCompleteSettings {
    return autoCompleteSettings({ load: this.#load, minLength: this.minLength, maxResults: this.maxResults,
      debounce: this.debounce, clearable: this.clearable })
  }
  #owned<T extends Element>(selector: string): T[] {
    return [...this.querySelectorAll<T>(selector)].filter(node => node.closest("m-auto-complete") === this)
  }
  #id(prefix: string): string {
    let id: string
    do { id = `${prefix}-${++nextId}` } while (this.ownerDocument.getElementById(id))
    return id
  }
  #prepare(): void {
    const document = this.ownerDocument
    const inputs = this.#owned<HTMLInputElement>("input")
    if (inputs.length > 1) throw new TypeError("Auto Complete accepts one native input.")
    let input = inputs[0]
    if (!input) {
      input = document.createElement("input")
      input.setAttribute("data-auto-complete-control", "")
      const preferred = this.id ? `${this.id}-input` : ""
      input.id = preferred && !document.getElementById(preferred) ? preferred : this.#id("m-ac-input")
      this.prepend(input)
    }
    this.#input = input
    let field = input.closest<HTMLElement>(".m-auto-complete__field")
    if (!field || !this.contains(field)) {
      field = document.createElement("div")
      field.className = "m-auto-complete__field"
      input.before(field)
      field.append(input)
    }
    const lists = this.#owned<HTMLDataListElement>("datalist")
    if (lists.length > 1) throw new TypeError("Auto Complete accepts one native datalist.")
    let list = input.list ?? lists[0]
    if (input.hasAttribute("list") && !input.list) throw new TypeError("Keep a valid native input list association.")
    if (!list) { list = document.createElement("datalist"); this.append(list) }
    if (!list.id) list.id = this.#id("m-ac-list")
    if (!input.hasAttribute("list")) input.setAttribute("list", list.id)
    if (this.#list !== list) { this.#projectedData = null; this.#configuration = "" }
    this.#list = list
    const buttons = this.#owned<HTMLButtonElement>("button[data-auto-complete-clear]")
    if (buttons.length > 1) throw new TypeError("Auto Complete accepts one clear action.")
    this.#clearButton = buttons[0] ?? document.createElement("button")
    if (!buttons[0]) {
      this.#clearButton.type = "button"
      this.#clearButton.hidden = true
      this.#clearButton.setAttribute("data-auto-complete-clear", "")
      this.#clearButton.setAttribute("aria-label", "Clear")
      this.#clearButton.textContent = "✕"
      field.append(this.#clearButton)
    }
    const statuses = this.#owned<HTMLElement>("[data-auto-complete-status]")
    if (statuses.length > 1) throw new TypeError("Auto Complete accepts one plain status region.")
    this.#status = statuses[0] ?? document.createElement("p")
    if (!statuses[0]) {
      this.#status.className = "m-auto-complete__status"
      this.#status.setAttribute("data-auto-complete-status", "")
      this.append(this.#status)
    }
  }
  #write(node: Element, name: string, value: string): void {
    let attributes = this.#writes.get(node)
    if (!attributes) { attributes = new Map(); this.#writes.set(node, attributes) }
    const current = node.getAttribute(name)
    let write = attributes.get(name)
    if (!write) { write = { before: current, last: current }; attributes.set(name, write) }
    if (current !== write.last) write.before = current
    if (current !== value) node.setAttribute(name, value)
    write.last = value
  }
  #syncInput(): void {
    const input = this.#control
    if (!input) return
    const defaultValue = this.getAttribute("value")
    if (this.#defaultSource !== defaultValue) {
      if (defaultValue !== null || this.#defaultSource !== undefined) {
        if (this.#controller) this.#active.defaultValue = defaultValue ?? ""
        else input.defaultValue = defaultValue ?? ""
      }
      this.#defaultSource = defaultValue
    }
    for (const name of ["placeholder", "disabled", "readonly", "required", "name", "form", "aria-label", "aria-labelledby", "aria-describedby"]) {
      const value = this.getAttribute(name)
      if (value !== null) this.#write(input, name, value)
      else {
        const write = this.#writes.get(input)?.get(name)
        if (!write) continue
        if (input.getAttribute(name) === write.last) {
          if (write.before === null) input.removeAttribute(name)
          else input.setAttribute(name, write.before)
        }
        this.#writes.get(input)!.delete(name)
      }
    }
  }
  #configurationData(): AutoCompleteSuggestion[] {
    return [...this.children].filter(node => node.localName === "m-option").map(node => {
      const text = node.textContent?.trim() ?? "", label = node.getAttribute("label")
      return { value: node.getAttribute("value") ?? text, ...(label !== null ? { label } : text ? { label: text } : {}),
        disabled: node.hasAttribute("disabled") }
    })
  }
  #syncOptions(): void {
    if (!this.#controller?.connected) return
    const configurations = [...this.children].filter(node => node.localName === "m-option")
    for (const node of configurations) this.#write(node, "hidden", "")
    if (this.#data) {
      if (this.#projectedData !== this.#data) {
        this.#controller.setOptions(this.#data)
        this.#projectedData = this.#data
      }
      return
    }
    const raw = [...this.children].filter((node): node is HTMLOptionElement => node.localName === "option")
    const data = autoCompleteSuggestions(this.#configurationData()), signature = JSON.stringify(data)
    if (!raw.length && signature === this.#configuration) return
    this.#controller.refresh()
    for (const option of raw) this.#list!.append(option)
    this.#controller.refresh()
    if (data.length || this.#configuration !== "" && this.#configuration !== "[]") this.#controller.setOptions(data, true)
    this.#configuration = signature
  }
}

export function registerAutoComplete(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([AutoComplete], registry)
}

if (typeof customElements !== "undefined") registerAutoComplete()
