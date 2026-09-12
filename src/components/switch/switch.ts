import { ViewElement } from "../../core/index.js"

export type SwitchSize = "small" | "medium" | "large"
export type SwitchStatus = "warning" | "error"
const sizes = ["small", "medium", "large"] as const
const statuses = ["warning", "error"] as const
const owner = Symbol.for("markup-ui.switch.owner")
type Owned = HTMLInputElement & { [owner]?: Switch }
interface Attribute { node: Element; name: string; before: string | null; last: string | null; base: string | null }
function boolean(value: boolean): void { if (typeof value !== "boolean") throw new TypeError("Expected a boolean.") }
function text(value: string): void { if (typeof value !== "string") throw new TypeError("Expected a string.") }

/**
 * One binary native checkbox owns the switch role, focus, labels, activation and forms.
 * Loading cancels native clicks; it does not disable submission or implement an async guard.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"Change","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Invalid","web":"invalid","bubbles":false,"cancelable":true,"composed":false}
 * @region {"name":"content","accepts":["phrasing","one native checkbox and label","aria-hidden state/icons/loading decoration"],"min":0,"max":null}
 */
export class Switch extends ViewElement {
  public static readonly tag = "m-switch"
  public static readonly observedAttributes = ["checked", "value", "name", "disabled", "required", "form", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", "loading", "size", "square", "status", "readonly"]
  private control?: Owned
  private generated = false
  private label?: HTMLLabelElement
  private initialized = false
  private observer?: MutationObserver
  private leases: Attribute[] = []
  private tasks = new Set<ReturnType<typeof setTimeout>>()
  private failure: string | null = null

  public connectedCallback(): void {
    if (!this.initialized) { this.upgradeProperties(); this.initialized = true }
    this.addEventListener("click", this.onClick, true)
    this.addEventListener("input", this.onInput)
    this.addEventListener("change", this.onInput)
    this.ownerDocument.addEventListener("reset", this.onReset, true)
    queueMicrotask(() => { if (this.isConnected) this.attemptRefresh() })
  }
  public disconnectedCallback(): void {
    this.release()
    this.removeEventListener("click", this.onClick, true)
    this.removeEventListener("input", this.onInput)
    this.removeEventListener("change", this.onInput)
    this.ownerDocument.removeEventListener("reset", this.onReset, true)
    this.tasks.forEach(clearTimeout); this.tasks.clear()
  }
  public attributeChangedCallback(name: string): void {
    if (this.control && !["loading", "size", "square", "status", "readonly"].includes(name)) {
      const value = this.getAttribute(name)
      if (value === null) this.control.removeAttribute(name)
      else this.control.setAttribute(name, value)
    }
    if (this.initialized && this.isConnected) this.attemptRefresh()
  }
  /** Original or generated checkbox. Absent checked/value/name use native false/"on"/"".
   * A late authored control replaces only a generated one; its live properties are retained.
   */
  public get native(): HTMLInputElement {
    const nodes = [...this.querySelectorAll<Owned>("input")].filter(node => node.closest("m-switch,m-checkbox") === this)
    const authored = nodes.filter(node => !this.generated || node !== this.control)
    if (authored.length > 1 || authored[0] && authored[0].type !== "checkbox") throw new TypeError("Expected one native checkbox.")
    if (this.control && this.contains(this.control) && (!this.generated || !authored.length)) return this.control
    const focused = this.control === this.ownerDocument.activeElement
    this.release()
    if (this.generated) {
      this.control?.remove()
      if (this.label) { this.label.replaceWith(...this.label.childNodes); delete this.label }
    }
    const control = authored[0] ?? this.ownerDocument.createElement("input") as Owned
    if (control[owner] && control[owner] !== this) throw new Error("Native switch already has an owner.")
    this.control = control
    this.generated = !authored.length
    if (this.generated) { control.type = "checkbox"; this.prepend(control) }
    for (const name of Switch.observedAttributes.slice(0, 11)) if (this.hasAttribute(name)) control.setAttribute(name, this.getAttribute(name)!)
    if (!control.hasAttribute("role")) control.setAttribute("role", "switch")
    control.setAttribute("data-switch-control", "")
    if (focused) control.focus()
    return control
  }
  /** Live boolean checkedness. Silent writes retain the native reset default and dirty-state rules. */
  public get checked(): boolean { return this.native.checked }
  public set checked(value: boolean) { boolean(value); this.binary(); this.native.checked = value }
  /** Native reset default, initialized by checked. Changing it follows native dirty checkedness. */
  public get defaultChecked(): boolean { return this.native.defaultChecked }
  public set defaultChecked(value: boolean) { boolean(value); this.native.defaultChecked = value }
  /** Native submission string, "on" when absent; never the boolean checked state. */
  public get value(): string { return this.native.value }
  public set value(value: string) { text(value); this.native.value = value }
  /** Native value attribute, initially "". Checkbox value reflects it with "on" fallback.
   * Reset does not restore an older submission string.
   */
  public get defaultValue(): string { return this.native.defaultValue }
  public set defaultValue(value: string) { text(value); this.native.defaultValue = value }
  public get name(): string { return this.native.name }
  public set name(value: string) { text(value); this.native.name = value }
  /** Own disabled flag, initially false; native fieldset/first-legend rules determine effective disabling. */
  public get disabled(): boolean { return this.native.disabled }
  public set disabled(value: boolean) { boolean(value); this.native.disabled = value }
  /** Native required constraint, initially false; unchecked required switches have valueMissing. */
  public get required(): boolean { return this.native.required }
  public set required(value: boolean) { boolean(value); this.native.required = value }
  /** Actual native association; use the form attribute for an external form. */
  public get form(): HTMLFormElement | null { return this.native.form }
  public get validity(): ValidityState { return this.native.validity }
  public get validationMessage(): string { return this.native.validationMessage }
  public get willValidate(): boolean { return this.native.willValidate }
  /** Presence loading flag OR authored aria-busy=true. Focus and successful submission are retained.
   * No pending request, checked-update callback or async completion is owned by Switch.
   */
  public get loading(): boolean { return this.hasAttribute("loading") || this.leases.some(item => item.name === "aria-busy" && item.base === "true") }
  public set loading(value: boolean) { this.setBooleanAttribute("loading", value) }
  public get size(): SwitchSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: SwitchSize) { this.setChoiceAttribute("size", value, sizes) }
  public get square(): boolean { return this.hasAttribute("square") }
  public set square(value: boolean) { this.setBooleanAttribute("square", value) }
  public get status(): SwitchStatus | null { return this.choiceAttribute("status", statuses, null) }
  public set status(value: SwitchStatus | null) { this.setNullableChoiceAttribute("status", value, statuses) }
  /** Last refresh/activation validation failure, otherwise null. Correct the content and refresh. */
  public get error(): string | null { return this.failure }
  public override focus(options?: FocusOptions): void { this.native.focus(options) }
  public override blur(): void { this.native.blur() }
  /** Native activation. Disabled/loading/canceled clicks emit no input/change. */
  public override click(): void { this.native.click() }
  public checkValidity(): boolean { return this.native.checkValidity() }
  public reportValidity(): boolean { return this.native.reportValidity() }
  public setCustomValidity(message: string): void { text(message); this.native.setCustomValidity(message) }

  private binary(): void {
    if (this.native.indeterminate) throw new TypeError("Switch is binary; clear native indeterminate.")
    if (this.native.readOnly || this.hasAttribute("readonly")) throw new TypeError("Checkbox readonly is unsupported; use disabled or loading.")
  }
  /** Adopt late content, validate binary semantics and reconcile reversible busy attributes.
   * Native properties are never intercepted and refresh emits no input/change.
   */
  public refresh(): void {
    this.pause()
    try {
      void this.size; void this.status
      const control = this.native as Owned
      this.binary()
      if (this.hasAttribute("role") || this.hasAttribute("tabindex") || control.type !== "checkbox"
        || control.getAttribute("role") !== "switch" || control.hasAttribute("aria-checked")
        || this.parentElement?.closest("label,button,a[href],summary")) throw new TypeError("Only the native checkbox owns the switch role and focus.")
      const focused = this.ownerDocument.activeElement
      let label = control.labels?.[0]
      if (!label) {
        label = this.querySelector<HTMLLabelElement>("label") ?? this.ownerDocument.createElement("label")
        if (!this.contains(label)) { label.append(...this.childNodes); this.append(label); this.label = label }
        else label.prepend(control)
      }
      if (label === this.label) for (const node of [...this.childNodes]) if (node !== label) label.append(node)
      if (focused === control && this.ownerDocument.activeElement !== control) control.focus()
      const skin = control.parentElement
      if (skin !== label && skin !== this) throw new TypeError("Keep the native input directly in its label or Switch.")
      skin.classList.add("m-switch")
      const decorations = [...this.querySelectorAll<HTMLElement>(".m-switch__state,[data-switch-loading]")].filter(node => node.closest("m-switch") === this)
      if (decorations.filter(node => node.hasAttribute("data-switch-loading")).length > 1) throw new TypeError("Expected at most one loading decoration.")
      for (const node of decorations) if (node.parentElement !== skin || node.getAttribute("aria-hidden") !== "true"
        || node.matches("[tabindex],[role]") || node.querySelector("button,input,select,textarea,a[href],[tabindex],[contenteditable],[role]")) throw new TypeError("Keep direct aria-hidden noninteractive decorations.")
      const named = (node: Node): boolean => [...node.childNodes].some(child => child.nodeType === 3 ? !!child.textContent?.trim()
        : child instanceof Element && !child.matches("input,[aria-hidden=true]") && named(child))
      const ids = control.getAttribute("aria-labelledby")?.trim().split(/\s+/)
      if (![...control.labels ?? []].some(named) || ids?.some(id => {
        const node = this.ownerDocument.getElementById(id)
        return !node?.textContent?.trim() || node.closest(".m-switch__state,[data-switch-loading]")
      })) throw new TypeError("Switch needs a real stable native label, separate from state decorations.")
      if (control[owner] && control[owner] !== this) throw new Error("Native switch already has an owner.")
      control[owner] = this
      for (const name of ["aria-busy", "aria-disabled"]) this.lease(control, name)
      const indicator = decorations.find(node => node.hasAttribute("data-switch-loading"))
      for (const item of this.leases) if (item.name === "hidden" && item.node !== indicator) this.restore(item)
      this.leases = this.leases.filter(item => item.name !== "hidden" || item.node === indicator)
      if (indicator) this.lease(indicator, "hidden", true)
      if (this.isConnected) for (const item of this.leases) {
        const value = item.name === "hidden" ? this.loading ? item.base : item.base ?? "" : this.loading ? "true" : item.base
        if (value === null) item.node.removeAttribute(item.name)
        else item.node.setAttribute(item.name, value)
        item.last = value
      }
      this.failure = null
    } catch (reason) { this.failure = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally {
      this.observer ??= new MutationObserver(records => { this.mark(records); this.attemptRefresh() })
      if (this.isConnected) this.observer.observe(this, { childList: true, subtree: true, attributes: true,
        attributeFilter: ["disabled", "readonly", "type", "role", "checked", "value", "form", "hidden", "aria-hidden", "aria-checked", "aria-busy", "aria-disabled", "aria-label", "aria-labelledby"] })
    }
  }
  private lease(node: Element, name: string, enhancement = false): void {
    if (this.leases.some(item => item.node === node && item.name === name)) return
    const before = node.getAttribute(name)
    this.leases.push({ node, name, before, last: before, base: enhancement ? null : before })
  }
  private mark(records: MutationRecord[]): void {
    for (const record of records) {
      const item = this.leases.find(item => item.node === record.target && item.name === record.attributeName)
      if (item) item.before = item.base = item.last = item.node.getAttribute(item.name)
    }
  }
  private pause(): void { this.mark(this.observer?.takeRecords() ?? []); this.observer?.disconnect() }
  private restore(item: Attribute): void {
    if (item.node.getAttribute(item.name) !== item.last) return
    if (item.before === null) item.node.removeAttribute(item.name)
    else item.node.setAttribute(item.name, item.before)
  }
  private release(): void {
    this.pause()
    this.leases.forEach(item => this.restore(item)); this.leases = []
    if (this.control?.[owner] === this) delete this.control[owner]
  }
  private report(reason: unknown, previous: string | null): void {
    this.failure = reason instanceof Error ? reason.message : String(reason)
    if (this.failure !== previous) this.emit<{ message: string }>("m:switch-error", { message: this.failure }, { bubbles: false })
  }
  private attemptRefresh = (): void => {
    const previous = this.failure
    try { this.refresh() } catch (reason) { this.report(reason, previous) }
  }
  private later(): void {
    const task = setTimeout(() => { this.tasks.delete(task); if (this.isConnected) this.attemptRefresh() }, 0)
    this.tasks.add(task)
  }
  private onClick = (event: Event): void => {
    if (event.target !== this.control) return
    const previous = this.failure
    try {
      this.refresh()
      // Native pre-activation has toggled checkedness. Cancellation alone performs rollback.
      if (this.loading || this.leases.some(item => item.name === "aria-disabled" && item.base === "true")
        || this.native.matches(":disabled")) event.preventDefault()
    } catch (reason) { event.preventDefault(); this.report(reason, previous) }
    this.later()
  }
  private onInput = (event: Event): void => { if (event.target === this.control) this.attemptRefresh() }
  private onReset = (event: Event): void => { if (event.target === this.control?.form) this.later() }
}
