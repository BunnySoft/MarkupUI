import { ViewElement } from "../../core/index.js"

export type InputNumberSize = "tiny" | "small" | "medium" | "large"
export type InputNumberStatus = "success" | "warning" | "error"
const sizes = ["tiny", "small", "medium", "large"] as const
const statuses = ["success", "warning", "error"] as const
const nativeAttributes = ["value", "min", "max", "step", "name", "placeholder", "disabled", "readonly", "required", "form", "autocomplete", "inputmode", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"]
function text(value: string): void { if (typeof value !== "string") throw new TypeError("Expected a string.") }
function finite(value: number | null): void {
  if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) throw new TypeError("Expected a finite number or null.")
}
function boolean(value: boolean): void { if (typeof value !== "boolean") throw new TypeError("Expected a boolean.") }

export interface InputNumberState {
  value: number | null
  text: string
  empty: boolean
  badInput: boolean
  valid: boolean
  valueMissing: boolean
  rangeUnderflow: boolean
  rangeOverflow: boolean
  stepMismatch: boolean
  canIncrement: boolean
  canDecrement: boolean
  stepError: string | null
}
const owner = Symbol.for("markup-ui.input-number.owner")
type Owned = HTMLInputElement & { [owner]?: InputNumber }
interface Attribute { node: HTMLButtonElement; name: string; before: string | null; base: string | null; last: string | null }

/**
 * One native number input owns editing, labels, focus, validation and submission.
 * Prefix/suffix content and optional named native step/clear buttons retain identity.
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"Change","web":"change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"Invalid","web":"invalid","bubbles":false,"cancelable":true,"composed":false}
 * @event {"name":"Clear","web":"m:input-number-clear","bubbles":true,"cancelable":false,"composed":false,"detail":{"previous":"{ value: number | null; text: string; badInput: boolean }"}}
 * @event {"name":"Error","web":"m:input-number-error","bubbles":false,"cancelable":false,"composed":false,"detail":{"message":"string"}}
 * @region {"name":"content","accepts":["one native input[type=number]","prefix/suffix phrasing","named native type=button decrement/increment/clear actions"],"min":0,"max":null}
 */
export class InputNumber extends ViewElement {
  public static readonly tag = "m-input-number"
  public static readonly observedAttributes = [...nativeAttributes, "size", "status", "round", "borderless"]
  #control?: Owned
  #generated = false
  #initialized = false
  #generation = 0
  #observer?: MutationObserver
  #leases: Attribute[] = []
  #buttons: (HTMLButtonElement | null)[] = []
  #tasks = new Set<ReturnType<typeof setTimeout>>()
  #composing = false
  #failure: string | null = null
  #probe?: HTMLInputElement
  #pendingAttributes = new Set<string>()
  #pendingValue = false
  #document?: Document

  public connectedCallback(): void {
    const generation = ++this.#generation
    if (!this.#initialized) { this.upgradeProperties(); this.#initialized = true }
    for (const type of ["input", "change", "compositionstart", "compositionend", "click"]) this.addEventListener(type, this.#onEvent, true)
    this.#document = this.ownerDocument
    this.#document.addEventListener("reset", this.#onReset, true)
    queueMicrotask(() => { if (this.isConnected && generation === this.#generation) this.#attemptRefresh() })
  }
  public disconnectedCallback(): void {
    this.#generation++
    this.#release()
    for (const type of ["input", "change", "compositionstart", "compositionend", "click"]) this.removeEventListener(type, this.#onEvent, true)
    this.#document?.removeEventListener("reset", this.#onReset, true)
    this.#composing = false
  }
  public attributeChangedCallback(name: string): void {
    if (this.#control && nativeAttributes.includes(name)) this.#attribute(name, this.getAttribute(name))
    if (this.#initialized && this.isConnected) this.#attemptRefresh()
  }
  /** Original or generated native input. Absent value/defaultValue/name/min/max/step are "".
   * Native stepping defaults to 1; no precision, rounding or input-time clamping is added.
   * Host native attributes forward once on adoption, then only on attribute changes.
   */
  public get native(): HTMLInputElement {
    const fields = this.#parts("input,textarea") as Owned[]
    const authored = fields.filter(node => !this.#generated || node !== this.#control)
    if (authored.length > 1 || authored[0] && (authored[0].type !== "number" || authored[0][owner] && authored[0][owner] !== this)) throw new TypeError("Expected one unowned native input[type=number].")
    if (this.#control && this.contains(this.#control) && (!this.#generated || !authored.length)) return this.#control
    if (this.#composing) throw new DOMException("Native input is composing.", "InvalidStateError")
    const previous = this.#generated ? this.#control : undefined
    if (previous?.validity.badInput) throw new DOMException("Native draft is invalid.", "InvalidStateError")
    this.#release()
    const focused = this.#control === this.ownerDocument.activeElement
    if (this.#generated) this.#control?.remove()
    this.#control = authored[0] ?? this.ownerDocument.createElement("input")
    this.#generated = !authored.length
    if (this.#generated) this.#control.type = "number"
    for (const name of nativeAttributes) if (this.hasAttribute(name)) this.#control.setAttribute(name, this.getAttribute(name)!)
    if (previous) {
      for (const name of this.#pendingAttributes) {
        const value = previous.getAttribute(name)
        if (value === null) this.#control.removeAttribute(name)
        else this.#control.setAttribute(name, value)
      }
      if (this.#pendingValue) this.#control.value = previous.value
    }
    this.#pendingAttributes.clear(); this.#pendingValue = false
    this.#control.setAttribute("data-number-control", "")
    if (this.#generated) this.prepend(this.#control)
    if (focused) this.#control.focus()
    return this.#control
  }
  #attribute(name: string, value: string | null): void {
    const control = this.native
    if (value === null) control.removeAttribute(name)
    else control.setAttribute(name, value)
    if (this.#generated) this.#pendingAttributes.add(name)
  }
  /** Nullable live number, initially null when empty. Silent writes retain defaultValue and native dirty state.
   * Finite out-of-range/off-grid values remain invalid, never rounded or clamped.
   */
  public get value(): number | null { const value = this.native.valueAsNumber; return Number.isFinite(value) ? value : null }
  public set value(value: number | null) {
    finite(value)
    if (this.#composing) throw new DOMException("Native input is composing.", "InvalidStateError")
    this.native.value = value === null ? "" : String(value)
    this.#pendingValue = this.#generated
    if (this.#initialized) this.refresh()
  }
  /** Native exposed string, initially "". Bad-input drafts may expose "" without being empty. */
  public get text(): string { return this.native.value }
  /** Native value attribute/reset string, initially "". Writes follow the native dirty-value flag, silently. */
  public get defaultValue(): string { return this.native.defaultValue }
  public set defaultValue(value: string) { text(value); this.#attribute("value", value); if (this.#initialized) this.refresh() }
  /** Native minimum string, initially ""; malformed native constraints retain browser interpretation. */
  public get min(): string { return this.native.min }
  public set min(value: string) { text(value); this.#attribute("min", value); if (this.#initialized) this.refresh() }
  /** Native maximum string, initially ""; never clamps an existing value. */
  public get max(): string { return this.native.max }
  public set max(value: string) { text(value); this.#attribute("max", value); if (this.#initialized) this.refresh() }
  /** Native step string, initially "" (effective 1). "any" permits edits but native stepping throws InvalidStateError. */
  public get step(): string { return this.native.step }
  public set step(value: string) { text(value); this.#attribute("step", value); if (this.#initialized) this.refresh() }
  public get name(): string { return this.native.name }
  public set name(value: string) { text(value); this.#attribute("name", value) }
  public get placeholder(): string { return this.native.placeholder }
  public set placeholder(value: string) { text(value); this.#attribute("placeholder", value) }
  /** Own flag, initially false. Effective disabledness follows native fieldset/first-legend rules. */
  public get disabled(): boolean { return this.native.disabled }
  public set disabled(value: boolean) { boolean(value); this.#attribute("disabled", value ? "" : null); if (this.#initialized) this.refresh() }
  /** Native readonly, initially false: blocks user actions but not silent value writes or submission. */
  public get readOnly(): boolean { return this.native.readOnly }
  public set readOnly(value: boolean) { boolean(value); this.#attribute("readonly", value ? "" : null); if (this.#initialized) this.refresh() }
  /** Native required, initially false; empty and bad input are distinct validity states. */
  public get required(): boolean { return this.native.required }
  public set required(value: boolean) { boolean(value); this.#attribute("required", value ? "" : null); if (this.#initialized) this.refresh() }
  public get form(): HTMLFormElement | null { return this.native.form }
  public get validity(): ValidityState { return this.native.validity }
  public get validationMessage(): string { return this.native.validationMessage }
  public get willValidate(): boolean { return this.native.willValidate }
  public get size(): InputNumberSize { return this.choiceAttribute("size", sizes, "medium") }
  public set size(value: InputNumberSize) { this.setChoiceAttribute("size", value, sizes) }
  public get status(): InputNumberStatus | null { return this.choiceAttribute("status", statuses, null) }
  public set status(value: InputNumberStatus | null) { this.setNullableChoiceAttribute("status", value, statuses) }
  public get round(): boolean { return this.hasAttribute("round") }
  public set round(value: boolean) { this.setBooleanAttribute("round", value) }
  public get borderless(): boolean { return this.hasAttribute("borderless") }
  public set borderless(value: boolean) { this.setBooleanAttribute("borderless", value) }
  /** Connected native value/validity/action snapshot; throws while disconnected. */
  public get state(): InputNumberState {
    if (!this.isConnected) throw new Error("InputNumber is disconnected.")
    this.refresh()
    return this.#snapshot()
  }
  /** Last native controller validation failure, otherwise null. */
  public get error(): string | null { return this.#failure }
  public override focus(options?: FocusOptions): void { this.native.focus(options) }
  public override blur(): void { this.native.blur() }
  public checkValidity(): boolean { return this.native.checkValidity() }
  public reportValidity(): boolean { return this.native.reportValidity() }
  public setCustomValidity(message: string): void { text(message); this.native.setCustomValidity(message); this.refresh() }
  /** Explicit user-intent step: native stepUp, then input/change only on a real editable change. */
  public stepUp(): boolean { return this.#move(1) }
  /** Explicit user-intent step: native stepDown, then input/change only on a real editable change. */
  public stepDown(): boolean { return this.#move(-1) }
  /** Explicit user intent: input, change, then m:input-number-clear({previous}). */
  public clear(): boolean {
    this.refresh()
    const control = this.native, generation = this.#generation
    if (!this.#editable() || control.value === "" && !control.validity.badInput) return false
    const previous = { value: this.value, text: control.value, badInput: control.validity.badInput }
    if (this.ownerDocument.activeElement === this.#buttons[2]) control.focus({ preventScroll: true })
    if (!this.#editable() || generation !== this.#generation || control !== this.#control) return false
    control.value = ""; this.refresh()
    if (this.#notify(control, generation)) {
      control.dispatchEvent(new CustomEvent("m:input-number-clear", { bubbles: true, detail: { previous } }))
    }
    return true
  }
  /** Reconcile native actions after direct native property writes, without editing or synthesizing events. */
  public refresh(): void {
    if (!this.isConnected) return
    this.#pause()
    try {
      void this.size; void this.status
      const control = this.native as Owned
      if (control[owner] && control[owner] !== this) throw new Error("Native number already owned.")
      if (this.getRootNode() !== this.ownerDocument || this.hasAttribute("role") || this.hasAttribute("tabindex")
        || this.closest("label,button,a[href],summary") || control.type !== "number" || control.hasAttribute("role")
        || this.#parts("[data-number-control]").length !== 1
        || !([...control.labels ?? []].some(label => label.textContent?.trim()) || control.getAttribute("aria-label")?.trim()
          || control.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => this.ownerDocument.getElementById(id)?.textContent?.trim()))) {
        throw new TypeError("Keep one labelled native number in a noninteractive light-DOM host.")
      }
      const buttons = ["decrement", "increment", "clear"].map(part => {
        const nodes = this.#parts(`[data-number-${part}]`), node = nodes[0]
        if (nodes.length > 1 || node && (!(node instanceof HTMLButtonElement) || node.getAttribute("type")?.toLowerCase() !== "button"
          || !(node.getAttribute("aria-label")?.trim() || node.textContent?.trim())
          || node.hasAttribute("role") || node.getAttribute("aria-hidden") === "true" || node.hasAttribute("popovertarget") || node.hasAttribute("commandfor")
          || node.parentElement?.closest("label,button,a[href],summary") || node.querySelector("button,input,select,textarea,a[href],[tabindex],[contenteditable],[role]"))) {
          throw new TypeError("Expected named type=button actions outside interaction.")
        }
        return node as HTMLButtonElement | undefined ?? null
      })
      for (const item of this.#leases) if (!buttons.includes(item.node)) this.#restore(item)
      this.#leases = this.#leases.filter(item => buttons.includes(item.node))
      this.#buttons = buttons
      for (const node of buttons) if (node) for (const name of ["hidden", "disabled"]) {
        if (!this.#leases.some(item => item.node === node && item.name === name)) {
          const before = node.getAttribute(name)
          this.#leases.push({ node, name, before, last: before, base: name === "hidden" ? null : before })
        }
      }
      control[owner] = this
      this.classList.add("m-input-number")
      const state = this.#snapshot()
      for (const item of this.#leases) {
        const index = buttons.indexOf(item.node)
        const unavailable = item.name === "hidden" ? index === 2 && state.empty
          : index === 0 ? !state.canDecrement : index === 1 ? !state.canIncrement : !this.#editable()
        const value = unavailable ? item.base ?? "" : item.base
        if (value !== null && this.ownerDocument.activeElement === item.node
          && !control.matches(":disabled") && !control.closest("[hidden],[inert]")) {
          control.focus({ preventScroll: true }); if (!this.isConnected) return
        }
        if (value === null) item.node.removeAttribute(item.name)
        else item.node.setAttribute(item.name, value)
        item.last = value
      }
      this.#failure = null
    } catch (reason) { this.#failure = reason instanceof Error ? reason.message : String(reason); throw reason }
    finally {
      this.#observer ??= new MutationObserver(records => { this.#mark(records); this.#attemptRefresh() })
      if (this.isConnected) {
        this.#observer.observe(this, { childList: true, subtree: true, attributes: true,
          attributeFilter: ["disabled", "readonly", "type", "role", "hidden", "inert", "min", "max", "step", "value", "required", "form", "aria-disabled", "aria-readonly"] })
        for (let node = this.parentElement; node; node = node.parentElement) this.#observer.observe(node, {
          childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"],
        })
      }
    }
  }
  #parts(selector: string): Element[] { return [...this.querySelectorAll(selector)].filter(node => node.closest("m-input-number,m-input,m-textarea") === this) }
  #editable(): boolean {
    const control = this.native
    return this.isConnected && control.isConnected && control.type === "number" && !this.#composing && !control.readOnly
      && !control.matches(":disabled") && control.getAttribute("aria-disabled") !== "true"
      && control.getAttribute("aria-readonly") !== "true" && !control.closest("[hidden], [inert]")
  }
  /** The retained native helper's off-DOM probe copies the value attribute as the possible step-grid base. */
  #candidate(direction: 1 | -1): { available: boolean; error: unknown | null } {
    const control = this.native
    if (this.#composing || control.validity.badInput) return { available: false, error: null }
    const probe = this.#probe ??= this.ownerDocument.createElement("input")
    probe.type = "number"
    for (const name of ["min", "max", "step", "value"]) {
      const value = control.getAttribute(name)
      if (value === null) probe.removeAttribute(name)
      else probe.setAttribute(name, value)
    }
    probe.value = control.value
    try {
      if (direction === 1) probe.stepUp()
      else probe.stepDown()
    } catch (reason) { return { available: false, error: reason } }
    if (!Number.isFinite(probe.valueAsNumber)) return { available: false, error: new RangeError("Nonfinite native step.") }
    return { available: probe.valueAsNumber !== this.value, error: null }
  }
  #snapshot(): InputNumberState {
    const control = this.native, up = this.#candidate(1), down = this.#candidate(-1), validity = control.validity
    const reason = up.error ?? down.error
    return {
      value: this.value, text: control.value, empty: control.value === "" && !validity.badInput,
      badInput: validity.badInput, valid: validity.valid, valueMissing: validity.valueMissing,
      rangeUnderflow: validity.rangeUnderflow, rangeOverflow: validity.rangeOverflow, stepMismatch: validity.stepMismatch,
      canIncrement: this.#editable() && up.available, canDecrement: this.#editable() && down.available,
      stepError: reason instanceof Error ? `${reason.name}: ${reason.message}` : reason === null ? null : String(reason),
    }
  }
  #mark(records: MutationRecord[]): void {
    for (const record of records) {
      const item = this.#leases.find(item => item.node === record.target && item.name === record.attributeName)
      if (item) item.before = item.base = item.last = item.node.getAttribute(item.name)
    }
  }
  #pause(): void {
    this.#mark(this.#observer?.takeRecords() ?? []); this.#observer?.disconnect()
    for (const item of this.#leases) if (item.node.getAttribute(item.name) !== item.last) item.before = item.base = item.last = item.node.getAttribute(item.name)
  }
  #restore(item: Attribute): void {
    if (item.node.getAttribute(item.name) !== item.last) return
    if (item.before === null) item.node.removeAttribute(item.name)
    else item.node.setAttribute(item.name, item.before)
    item.last = item.before
  }
  #release(): void {
    this.#pause()
    this.#tasks.forEach(clearTimeout); this.#tasks.clear()
    if (this.#leases.some(item => item.name === "hidden" && item.before !== null && this.ownerDocument.activeElement === item.node)
      && this.#control?.isConnected && !this.#control.matches(":disabled") && !this.#control.closest("[hidden],[inert]")) this.#control.focus({ preventScroll: true })
    this.#leases.forEach(item => this.#restore(item))
    if (this.#control?.[owner] === this) delete this.#control[owner]
  }
  #report(reason: unknown, previous: string | null): void {
    this.#failure = reason instanceof Error ? reason.message : String(reason)
    if (previous !== this.#failure) this.emit<{ message: string }>("m:input-number-error", { message: this.#failure }, { bubbles: false })
  }
  #attemptRefresh(): void { const previous = this.#failure; try { this.refresh() } catch (reason) { this.#report(reason, previous) } }
  #notify(control: HTMLInputElement, generation: number): boolean {
    if (!this.isConnected || generation !== this.#generation || control !== this.#control) return false
    control.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
    control.dispatchEvent(new Event("change", { bubbles: true }))
    return true
  }
  #move(direction: 1 | -1): boolean {
    this.refresh()
    const control = this.native, generation = this.#generation
    if (!this.#editable() || control.validity.badInput) return false
    const next = this.#candidate(direction)
    if (next.error) throw next.error
    if (!next.available) return false
    const before = this.value
    if (direction === 1) control.stepUp()
    else control.stepDown()
    this.refresh()
    if (this.value === before) return false
    this.#notify(control, generation)
    return true
  }
  #later(callback: () => void): void {
    const generation = this.#generation
    const task = setTimeout(() => { this.#tasks.delete(task); if (this.isConnected && generation === this.#generation) callback() }, 0)
    this.#tasks.add(task)
  }
  #onEvent = (event: Event): void => {
    if (event.target === this.#control) {
      if (event.type === "input" || event.type === "change") this.#pendingValue = this.#generated
      if (event.type === "compositionstart") this.#composing = true
      if (event.type === "compositionend") this.#composing = false
      this.#attemptRefresh()
    } else if (event.type === "click") {
      const button = event.target instanceof Element ? event.target.closest("button") : null
      if (!button || !this.#buttons.includes(button)) return
      const action = this.#buttons.indexOf(button), control = this.#control
      this.#later(() => {
        if (event.defaultPrevented || !this.contains(button) || button.disabled || button.hidden || button.matches(":disabled")) return
        const previous = this.#failure
        try {
          this.refresh()
          if (this.#buttons[action] !== button || this.#control !== control) return
          if (action === 2) this.clear(); else this.#move(action === 1 ? 1 : -1)
        }
        catch (reason) { this.#report(reason, previous) }
      })
    }
  }
  #onReset = (event: Event): void => {
    if (event.target === this.#control?.form) {
      this.#tasks.forEach(clearTimeout); this.#tasks.clear()
      this.#later(() => {
        if (!event.defaultPrevented) { this.#composing = false; this.#pendingValue = false }
        this.#attemptRefresh()
      })
    }
  }
}
