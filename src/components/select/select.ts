import { ViewElement } from "../../core/index.js"
import { createSelect, selectOptions, selectValue, setSelectValue } from "../native-select.js"
import type { SelectController, SelectValue } from "../native-select.js"

export type { SelectValue } from "../native-select.js"
export type SelectSize = "tiny" | "small" | "medium" | "large"
export type SelectStatus = "success" | "warning" | "error"
const sizes = ["tiny", "small", "medium", "large"] as const
const statuses = ["success", "warning", "error"] as const
const nativeAttributes = ["name", "disabled", "required", "multiple", "form", "autocomplete", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"]
function text(value: string): void { if (typeof value !== "string") throw new TypeError("Expected a string.") }
function boolean(value: boolean): void { if (typeof value !== "boolean") throw new TypeError("Expected a boolean.") }
function integer(value: number, minimum: number): void {
  if (!Number.isInteger(value) || value < minimum || value > 2147483647) throw new RangeError("Expected an in-range integer.")
}

/**
 * One native select owns selection, keyboard, focus, validation and forms.
 * Native options/optgroups and authored helper nodes retain identity.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"Change","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Invalid","web":"invalid","bubbles":false,"cancelable":true,"composed":false}
 * @event {"name":"Clear","web":"m:select-clear","bubbles":true,"cancelable":false,"composed":false,"detail":{"previous":"SelectValue"}}
 * @event {"name":"Error","web":"m:select-error","bubbles":false,"cancelable":false,"composed":false,"detail":{"message":"string"}}
 * @region {"name":"content","accepts":["one native select or direct native options/optgroups","phrasing affixes","named native clear button","labelled external literal filter for a native list","plain empty message"],"min":0,"max":null}
 */
export class Select extends ViewElement {
  public static readonly tag = "m-select"
  public static readonly observedAttributes = ["name", "disabled", "required", "multiple", "form", "autocomplete", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", "size", "status", "borderless", "list-size"]
  #control?: HTMLSelectElement
  #generated = false
  #initialized = false
  #generation = 0
  #controller: SelectController | undefined
  #observer?: MutationObserver
  #anatomy: Element[] = []
  #failure: string | null = null
  #pendingAttributes = new Set<string>()
  #pendingSelection = false

  public connectedCallback(): void {
    const generation = ++this.#generation
    if (!this.#initialized) { this.upgradeProperties(); this.#initialized = true }
    this.addEventListener("input", this.#onInput)
    queueMicrotask(() => { if (this.isConnected && generation === this.#generation) this.#attemptRefresh() })
  }
  public disconnectedCallback(): void { this.#generation++; this.#observer?.disconnect(); this.#release(); this.removeEventListener("input", this.#onInput) }
  #onInput = (event: Event): void => {
    if (this.#generated && event.target === this.#control) this.#pendingSelection = true
  }
  public attributeChangedCallback(name: string): void {
    if (this.#control && (nativeAttributes.includes(name) || name === "list-size")) this.#attribute(name === "list-size" ? "size" : name, this.getAttribute(name))
    if (this.#initialized && this.isConnected) this.#attemptRefresh()
  }
  #parts(selector: string): Element[] { return [...this.querySelectorAll(selector)].filter(node => node.closest("m-select,[data-select]") === this) }
  #release(): void { this.#controller?.disconnect(); this.#controller = undefined }
  /** Original or generated native owner. No cloned options, hidden form proxy or defaultValue property.
   * Host native attributes forward on adoption and subsequent host changes, not every refresh.
   * Replacement during a tracked composing filter draft throws InvalidStateError; end composition and refresh.
   */
  public get native(): HTMLSelectElement {
    const fields = this.#parts("select") as HTMLSelectElement[]
    const authored = fields.filter(node => !this.#generated || node !== this.#control)
    if (authored.length > 1 || this.#parts("m-option").length) throw new TypeError("Use one native select and native option/optgroup nodes, not m-option.")
    let control = this.#control
    if (!control || !this.contains(control) || this.#generated && authored.length) {
      if (this.#controller?.composing) throw new DOMException("Do not replace the native owner while its filter is composing.", "InvalidStateError")
      const previous = this.#generated && control && this.contains(control) ? control : undefined
      const next = authored[0] ?? this.ownerDocument.createElement("select")
      const selection = previous && this.#pendingSelection ? selectValue(previous) : undefined
      const options = [...(previous ? selectOptions(previous) : []), ...selectOptions(next)]
      if (new Set(options.map(option => option.value)).size !== options.length) throw new TypeError("Replacement options require unique values; keep the original nodes.")
      for (const name of nativeAttributes) if (this.hasAttribute(name)) next.setAttribute(name, this.getAttribute(name)!)
      if (this.hasAttribute("list-size")) next.setAttribute("size", this.getAttribute("list-size")!)
      if (previous) {
        for (const name of this.#pendingAttributes) {
          const value = previous.getAttribute(name)
          if (value === null) next.removeAttribute(name)
          else next.setAttribute(name, value)
        }
        if (selection !== undefined) setSelectValue(next, selection, false, options)
      }
      this.#release()
      const focused = previous === this.ownerDocument.activeElement
      if (previous) {
        if (previous.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING) next.prepend(...previous.childNodes)
        else next.append(...previous.childNodes)
      }
      previous?.remove()
      this.#control = control = next; this.#generated = !authored.length
      if (selection !== undefined) setSelectValue(control, selection)
      this.#pendingAttributes.clear(); this.#pendingSelection = false
      control.setAttribute("data-select-control", "")
      if (this.#generated) this.prepend(control)
      if (focused) control.focus()
    }
    const options = [...this.children].filter(node => node.localName === "option" || node.localName === "optgroup")
    if (options.length) {
      const children = [...this.children], index = children.indexOf(control)
      control.prepend(...options.filter(node => children.indexOf(node) < index))
      control.append(...options.filter(node => children.indexOf(node) > index))
    }
    if (this.#parts("option,optgroup").some(node => node.closest("select") !== control)) throw new TypeError("Options and groups must belong to the native select.")
    return control
  }
  #attribute(name: string, value: string | null): void {
    const control = this.native
    if (value === null) control.removeAttribute(name)
    else control.setAttribute(name, value)
    if (this.#generated) this.#pendingAttributes.add(name)
  }
  /** Native mode, initially false; changing it retains browser selectedness reconciliation. */
  public get multiple(): boolean { return this.native.multiple }
  public set multiple(value: boolean) { boolean(value); this.#attribute("multiple", value ? "" : null); if (this.#initialized) this.refresh() }
  /** Computed single string (including "") or null; multiple uses DOM-order strings[].
   * Requires explicit unique option values. Unknown/duplicate/wrong-mode writes throw before selection changes.
   * Silent assignments use native selectedness setters, including equal writes; defaults remain option.defaultSelected.
   */
  public get value(): SelectValue { const control = this.native; selectOptions(control); return selectValue(control) }
  public set value(value: string | null | readonly string[]) {
    const control = this.native
    setSelectValue(control, value)
    this.#pendingSelection = this.#generated
    this.#controller?.refresh()
  }
  /** Native index, initially -1 for an empty owner. Out-of-range indices produce native no-selection.
   * @min -2147483648
   * @max 2147483647
   * @integer
   */
  public get selectedIndex(): number { return this.native.selectedIndex }
  public set selectedIndex(value: number) {
    integer(value, -2147483648)
    this.native.selectedIndex = value
    this.#pendingSelection = this.#generated
    this.#controller?.refresh()
  }
  /** Live native collections, not copies or a data-options renderer. */
  public get options(): HTMLOptionsCollection { return this.native.options }
  public get selectedOptions(): HTMLCollectionOf<HTMLOptionElement> { return this.native.selectedOptions }
  /** Native visible-row count, initially 0; distinct from logical visual size.
   * @min 0
   * @max 2147483647
   * @integer
   */
  public get listSize(): number { return this.native.size }
  public set listSize(value: number) { integer(value, 0); this.#attribute("size", String(value)); if (this.#initialized) this.refresh() }
  /** Native name, initially ""; only successful native options enter FormData. */
  public get name(): string { return this.native.name }
  public set name(value: string) { text(value); this.#attribute("name", value) }
  /** Own flag, initially false. Effective state includes fieldset/first-legend rules. */
  public get disabled(): boolean { return this.native.disabled }
  public set disabled(value: boolean) { boolean(value); this.#attribute("disabled", value ? "" : null); if (this.#initialized) this.refresh() }
  /** Native required, initially false; the browser owns placeholder-label-option validity. */
  public get required(): boolean { return this.native.required }
  public set required(value: boolean) { boolean(value); this.#attribute("required", value ? "" : null) }
  public get form(): HTMLFormElement | null { return this.native.form }
  public get validity(): ValidityState { return this.native.validity }
  public get validationMessage(): string { return this.native.validationMessage }
  public get willValidate(): boolean { return this.native.willValidate }
  public get size(): SelectSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: SelectSize) { this.setChoiceAttribute("size", value, sizes) }
  public get status(): SelectStatus | null { return this.choiceAttribute("status", statuses, null) }
  public set status(value: SelectStatus | null) { this.setNullableChoiceAttribute("status", value, statuses) }
  public get borderless(): boolean { return this.hasAttribute("borderless") }
  public set borderless(value: boolean) { this.setBooleanAttribute("borderless", value) }
  /** Original optional external text/search input; null without authored filtering anatomy. */
  public get filter(): HTMLInputElement | null { return this.#parts("[data-select-filter]")[0] as HTMLInputElement | undefined ?? null }
  /** Most recent anatomy/option validation error, otherwise null. */
  public get error(): string | null { return this.#failure ?? this.#controller?.error ?? null }
  public override focus(options?: FocusOptions): void { this.native.focus(options) }
  public override blur(): void { this.native.blur() }
  public checkValidity(): boolean { return this.native.checkValidity() }
  public reportValidity(): boolean { return this.native.reportValidity() }
  public setCustomValidity(message: string): void { text(message); this.native.setCustomValidity(message) }
  /** Native picker; platform support, transient activation and native exceptions apply. No hidePicker. */
  public showPicker(): void { this.native.showPicker() }
  /** Native insertion preserves node/listener identity; invalid keys are reported by refresh. */
  public add(element: HTMLOptionElement | HTMLOptGroupElement, before?: HTMLElement | number | null): void { this.native.add(element, before); this.refresh() }
  public item(index: number): HTMLOptionElement | null { return this.native.item(index) }
  public namedItem(name: string): HTMLOptionElement | null { return this.native.namedItem(name) }
  /** Native remove(index); without an index removes the host, as HTMLElement.remove(). */
  public override remove(index?: number): void { if (index === undefined) super.remove(); else { this.native.remove(index); this.refresh() } }
  /** Silent literal list filter. Requires a connected authored filter; composing drafts cannot be replaced. */
  public setFilter(value: string): void {
    text(value); this.refresh()
    if (!this.#controller) throw new Error("Select has no connected filter.")
    this.#controller.setFilter(value)
  }
  /** Explicit user intent: input, change, then m:select-clear({previous}), only for an editable selection.
   * Single clears to the marked placeholder or null; multiple clears to []. Not a silent setter.
   */
  public clear(): boolean { this.refresh(); return this.#controller?.clear() ?? false }
  /** Reconcile late anatomy/options and helper visibility. Never restore removed values or emit native edits. */
  public refresh(): void {
    if (!this.isConnected) return
    this.#observer?.disconnect()
    try {
      void this.size; void this.status
      void this.native
      this.classList.add("m-select"); this.setAttribute("data-select", "")
      const anatomy = this.#parts("select,[data-select-control],[data-select-clear],[data-select-filter],[data-select-search],[data-select-empty]")
      if (!this.#controller?.connected || anatomy.length !== this.#anatomy.length
        || anatomy.some((node, index) => node !== this.#anatomy[index])) {
        const composing = this.#controller?.filter === this.filter && this.#controller?.composing || false
        this.#release()
        this.#controller = createSelect(this, composing, true)
        this.#anatomy = anatomy
      } else this.#controller.refresh()
      this.#failure = null
    } catch (reason) { this.#failure = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally {
      this.#observer ??= new MutationObserver(() => this.#attemptRefresh())
      if (this.isConnected) this.#observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["multiple"] })
    }
  }
  #attemptRefresh(): void {
    const previous = this.error
    try { this.refresh() } catch {
      if (previous !== this.error) this.emit("m:select-error", { message: this.error! }, { bubbles: false })
    }
  }
}
