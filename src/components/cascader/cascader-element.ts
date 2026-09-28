import { ViewElement } from "../../core/index.js"
import { createCascader } from "./cascader.js"
import type { CascaderController, CascaderOptions, CascaderState } from "./cascader.js"
import { prepareHierarchy } from "../tree/source.js"
import type { HierarchyItem, HierarchyLoadResult } from "../tree/source.js"

export type CascaderItem = HierarchyItem
export type CascaderLoadResult = HierarchyLoadResult
/** Web node descriptors are supplied to this explicit resource callback. */
export type CascaderLoader = NonNullable<CascaderOptions["load"]>

/**
 * Hierarchical selection through native dependent selects, without implicit child selection.
 * @event {"name":"Change","web":"m:cascader-change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string | null","path":"readonly string[]","complete":"boolean","action":"string"}}
 * @event {"name":"Load","web":"m:cascader-load","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Error","web":"m:cascader-error","bubbles":true,"cancelable":false,"composed":false,"detail":{"error":"unknown"}}
 */
export class Cascader extends ViewElement {
  public static readonly tag = "m-cascader"
  public static readonly observedAttributes = ["options", "value", "default-value", "label", "name", "required", "disabled", "clearable", "placeholder", "selection", "show-path", "separator"]
  #controller: CascaderController | undefined
  #initial: CascaderOptions = {}
  #data: readonly CascaderItem[] = []
  #root: HTMLFieldSetElement | undefined
  #source = this.ownerDocument.createElement("ul")
  #upgraded = false
  #reflecting = false
  #loader: CascaderLoader | undefined
  #resume: CascaderState | undefined

  public connectedCallback(): void {
    if (!this.#upgraded) { this.#upgraded = true; this.upgradeProperties() }
    if (!this.#root) this.#create()
    this.#sync()
    this.#controller = createCascader(this.#root!, { ...this.#settings(), resume: this.#resume, ...this.#initial }, this)
    this.#initial = {}
  }
  public disconnectedCallback(): void {
    if (this.connected) this.#resume = this.#controller!.state
    this.#controller?.disconnect()
  }
  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (before === after || this.#reflecting) return
    try {
      if (name === "options") this.options = JSON.parse(after ?? "[]") as CascaderItem[]
      else if (name === "value") this.value = after
      else if (name === "default-value") this.defaultValue = after
      else if (this.connected) this.#controller!.configure(this.#settings(), () => this.#sync())
    } catch (error) { this.#reflect(name, before); throw error }
  }
  /** Immutable item snapshot. The options attribute accepts the same data as JSON. @default [] */
  public get options(): readonly CascaderItem[] { return this.#data }
  public set options(value: readonly CascaderItem[]) {
    const next = prepareHierarchy(this.ownerDocument, value, 8), previous = [...this.#source.childNodes]
    this.#source.replaceChildren(...next.nodes)
    try { this.refresh() }
    catch (error) { this.#source.replaceChildren(...previous); try { this.refresh() } catch { /* Preserve the native fault gate. */ } throw error }
    this.#data = next.items
  }
  /** Terminal key or null; a partial path never masquerades as a selected value. */
  public get value(): string | null { return this.connected ? this.state.value : this.#initial.value !== undefined ? this.#initial.value : this.#resume?.value ?? null }
  public set value(value: string | null) {
    this.#key(value)
    if (this.connected) this.#controller!.setValue(value)
    else { this.#initial.value = value; delete this.#initial.path }
    this.#reflect("value", value)
  }
  /** Explicit contiguous path, including incomplete paths. Silent programmatic write. */
  public get path(): readonly string[] { return this.connected ? this.state.path : this.#initial.path ?? this.#resume?.path ?? [] }
  public set path(value: readonly string[]) {
    if (!Array.isArray(value) || value.length > 8 || Array.from(value).some(key => typeof key !== "string" || !key)
      || new Set(value).size !== value.length) throw new TypeError("Use a contiguous path of unique string keys.")
    if (this.connected) this.#controller!.setPath(value)
    else { this.#initial.path = [...value]; delete this.#initial.value }
  }
  /** Native form reset target, independent of the live path. */
  public get defaultValue(): string | null { return this.connected ? this.state.defaultPath.at(-1) ?? null : this.#initial.defaultValue !== undefined ? this.#initial.defaultValue : this.#resume?.defaultPath.at(-1) ?? null }
  public set defaultValue(value: string | null) {
    this.#key(value)
    if (this.connected) this.#controller!.setDefaultValue(value)
    else this.#initial.defaultValue = value
    this.#reflect("default-value", value)
  }
  public get label(): string { return this.getAttribute("label") ?? "Location" }
  public set label(value: string) { this.#text(value); this.setStringAttribute("label", value) }
  /** Literal name shared by active columns, submitted in path order. */
  public get name(): string { return this.getAttribute("name") ?? "" }
  public set name(value: string) { this.setStringAttribute("name", value) }
  public get required(): boolean { return this.hasAttribute("required") }
  public set required(value: boolean) { this.setBooleanAttribute("required", value) }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get clearable(): boolean { return this.hasAttribute("clearable") }
  public set clearable(value: boolean) { this.setBooleanAttribute("clearable", value) }
  public get placeholder(): string { return this.getAttribute("placeholder") ?? "Choose" }
  public set placeholder(value: string) { this.#text(value); this.setStringAttribute("placeholder", value) }
  public get selection(): "leaf" | "any" { return this.choiceAttribute("selection", ["leaf", "any"], "leaf") }
  public set selection(value: "leaf" | "any") { this.setChoiceAttribute("selection", value, ["leaf", "any"]) }
  public get showPath(): boolean { return this.booleanAttribute("show-path", true) }
  public set showPath(value: boolean) { this.setBooleanAttribute("show-path", value, false) }
  public get separator(): string { return this.getAttribute("separator") ?? " / " }
  public set separator(value: string) {
    if (typeof value !== "string" || value.length > 32) throw new TypeError("Separator supports at most 32 characters.")
    this.setStringAttribute("separator", value)
  }
  public get load(): CascaderLoader | undefined { return this.#loader }
  public set load(value: CascaderLoader | undefined) {
    if (value !== undefined && typeof value !== "function") throw new TypeError("Load must be a function.")
    if (this.connected) this.#controller!.configure({ ...this.#settings(), load: value })
    this.#loader = value
  }
  public get connected(): boolean { return this.#controller?.connected ?? false }
  public get error(): unknown { return this.#controller?.error ?? null }
  public get state(): CascaderState { return this.#require().state }
  /** Web inspection surface: the actual native form controls. */
  public get controls(): readonly HTMLSelectElement[] { return this.#controller?.controls ?? [] }
  public clear(): boolean { return this.#require().clear() }
  public loadChildren(): Promise<boolean> { return this.#require().load() }
  public refresh(): void { if (this.connected) this.#controller!.refresh() }
  public override focus(options?: FocusOptions): void { this.controls.find(control => !control.matches(":disabled") && !control.closest("[hidden]"))?.focus(options) }
  public override blur(): void { this.controls.find(control => control === this.ownerDocument.activeElement)?.blur() }
  #require(): CascaderController { if (!this.connected) throw new Error("Cascader is disconnected."); return this.#controller! }
  #key(value: string | null): void { if (value !== null && (typeof value !== "string" || !value)) throw new TypeError("Use a nonempty key or null.") }
  #text(value: string): void { if (typeof value !== "string" || !value.trim() || value.length > 1024) throw new TypeError("Use a nonempty label of at most 1024 characters.") }
  #reflect(name: string, value: string | null): void {
    if (this.getAttribute(name) === value) return
    this.#reflecting = true
    try { this.setStringAttribute(name, value) } finally { this.#reflecting = false }
  }
  #settings(): CascaderOptions {
    if (this.separator.length > 32) throw new TypeError("Separator supports at most 32 characters.")
    return { selection: this.selection, showPath: this.showPath, separator: this.separator, load: this.load }
  }
  #sync(): void {
    this.#text(this.label); this.#text(this.placeholder)
    const root = this.#root!
    root.disabled = this.disabled; root.firstElementChild!.textContent = this.label
    for (const [index, control] of [...this.#controller?.controls ?? root.querySelectorAll<HTMLSelectElement>("[data-cascader-control]")].entries()) {
      control.name = this.name; control.required = index === 0 && this.required
      control.previousSibling!.textContent = `${this.label} ${index + 1}`
      control.options[0]!.textContent = this.placeholder
    }
    root.querySelector<HTMLButtonElement>("button")!.disabled = !this.clearable
  }
  #create(): void {
    const document = this.ownerDocument, root = document.createElement("fieldset"), legend = document.createElement("legend")
    root.className = "m-cascader"; root.dataset.cascader = ""
    const source = document.createElement("section"), list = this.#source, columns = document.createElement("div")
    source.className = "m-tree"; source.dataset.tree = ""; source.dataset.cascaderSource = ""; source.hidden = true; source.setAttribute("aria-label", "Choices")
    list.dataset.treeList = ""; source.append(list); columns.dataset.cascaderColumns = ""
    for (let index = 0; index < 8; index++) {
      const label = document.createElement("label"), text = document.createElement("span")
      const select = document.createElement("select"), placeholder = document.createElement("option")
      label.dataset.cascaderColumn = ""; select.dataset.cascaderControl = ""; placeholder.value = ""; placeholder.defaultSelected = true
      select.append(placeholder); label.append(text, select); columns.append(label)
    }
    const path = document.createElement("p"), status = document.createElement("p"), clear = document.createElement("button")
    path.dataset.cascaderPath = ""; status.dataset.cascaderStatus = ""; status.setAttribute("aria-live", "polite")
    clear.type = "button"; clear.dataset.cascaderClear = ""; clear.textContent = "Clear"
    root.append(legend, source, columns, path, status, clear); this.#root = root; this.append(root)
  }
}
