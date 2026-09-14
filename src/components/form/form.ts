import { coordinateForm } from "./controller.js"
import type { FormController, FormItemOptions, FormValidationReason, FormValidationResult, FormControl } from "./controller.js"
import { FormItem, FormLayout } from "./item.js"

const nativeAttributes = ["action", "method", "enctype", "target", "novalidate", "autocomplete", "name", "accept-charset", "rel"]
const methods = ["get", "post", "dialog"] as const
const encodings = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"] as const
function text(value: string): void { if (typeof value !== "string") throw new TypeError("Expected a string.") }

/**
 * One real native form owns submission, reset and constraint validation.
 * Custom validation is explicit and never intercepts submission or sets custom validity.
 * @region {"name":"content","accepts":["one native form","native controls and FormItem/FormItemGi content for a generated form"],"min":0,"max":null}
 * @event {"name":"Submit","web":"submit","bubbles":true,"cancelable":true,"composed":false}
 * @event {"name":"Reset","web":"reset","bubbles":true,"cancelable":true,"composed":false}
 * @event {"name":"Invalid","web":"invalid","bubbles":false,"cancelable":true,"composed":false}
 * @event {"name":"Error","web":"m:form-error","bubbles":false,"cancelable":false,"composed":false,"detail":{"key":"string | null","error":"unknown"}}
 */
export class Form extends FormLayout {
  public static readonly tag = "m-form"
  public static readonly observedAttributes = ["action", "method", "enctype", "target", "novalidate", "autocomplete", "name", "accept-charset", "rel", "validate-on-blur", "size", "label-placement", "inline"]
  #native?: HTMLFormElement
  #generated = false
  #initialized = false
  #observer?: MutationObserver
  #controller: FormController | undefined
  #items: readonly FormItemOptions[] | null = null
  #mapping: readonly FormItemOptions[] = []
  #blur = false
  #pending = new Set<string>()
  #error: unknown = null
  #paused = false
  #presentation = new Map<string, { before: string | null; last: string | null }>()

  public connectedCallback(): void {
    this.#paused = false
    if (!this.#initialized) { this.upgradeProperties(); this.#initialized = true }
    queueMicrotask(() => { if (this.isConnected) this.#attempt() })
  }
  public disconnectedCallback(): void { this.disconnect() }
  public attributeChangedCallback(name: string): void {
    if (this.#native && nativeAttributes.includes(name)) this.#attribute(name, this.getAttribute(name))
    if (this.#initialized && this.isConnected) this.#attempt()
  }
  /** Original or generated form. Give the native form its own ID for external controls.
   * Host attributes forward only on adoption or host edits; native attributes/styles remain writable.
   * Forwarded host inputs: action, method, enctype, target, novalidate, autocomplete, name, accept-charset, rel.
   * Native forms must not be nested. Late authored forms replace only a generated owner.
   */
  public get native(): HTMLFormElement {
    if (this.parentElement?.closest("form,m-form")) throw new TypeError("Do not nest Form or native forms.")
    const forms = [...this.querySelectorAll<HTMLFormElement>("form")].filter(node => node.closest("m-form") === this)
    const authored = forms.filter(node => !this.#generated || node !== this.#native)
    if (authored.length > 1) throw new TypeError("Expected one native form.")
    const focused = this.contains(this.ownerDocument.activeElement) ? this.ownerDocument.activeElement as HTMLElement : null
    if (!this.#native || !this.contains(this.#native) || this.#generated && authored.length) {
      const previous = this.#generated && this.#native && this.contains(this.#native) ? this.#native : undefined
      const next = authored[0] ?? this.ownerDocument.createElement("form")
      if (previous?.contains(next)) previous.before(next)
      for (const name of nativeAttributes) if (this.hasAttribute(name)) next.setAttribute(name, this.getAttribute(name)!)
      if (previous) {
        for (const name of this.#pending) {
          const value = previous.getAttribute(name)
          if (value === null) next.removeAttribute(name)
          else next.setAttribute(name, value)
        }
        next.prepend(...previous.childNodes)
      }
      this.#controller?.disconnect(); this.#controller = undefined
      this.#presentation.clear()
      previous?.remove()
      this.#native = next; this.#generated = !authored.length; this.#pending.clear()
      if (this.#generated) this.append(next)
    }
    if (this.#generated) {
      const nodes = [...this.childNodes], index = nodes.indexOf(this.#native)
      this.#native.prepend(...nodes.slice(0, index)); this.#native.append(...nodes.slice(index + 1))
    }
    if (this.#native.querySelector("form,m-form")) throw new TypeError("Do not nest Form or native forms.")
    if (focused?.isConnected && focused !== this.ownerDocument.activeElement) focused.focus({ preventScroll: true })
    return this.#native
  }
  #attribute(name: string, value: string | null): void {
    const native = this.native
    if (value === null) native.removeAttribute(name)
    else native.setAttribute(name, value)
    if (this.#generated) this.#pending.add(name)
  }
  /** Resolved native action URL; absence resolves to the document URL. */
  public get action(): string { return Reflect.get(HTMLFormElement.prototype, "action", this.native) as string }
  public set action(value: string) { text(value); this.#attribute("action", value) }
  /** Native method is get when absent. Invalid authored host tokens throw on refresh. */
  public get method(): "get" | "post" | "dialog" { return Reflect.get(HTMLFormElement.prototype, "method", this.native) as "get" | "post" | "dialog" }
  public set method(value: "get" | "post" | "dialog") { if (!methods.includes(value)) throw new RangeError("Invalid method."); this.#attribute("method", value) }
  /** Native encoding is application/x-www-form-urlencoded when absent. */
  public get enctype(): "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain" {
    return Reflect.get(HTMLFormElement.prototype, "enctype", this.native) as "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain"
  }
  public set enctype(value: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain") { if (!(encodings as readonly string[]).includes(value)) throw new RangeError("Invalid enctype."); this.#attribute("enctype", value) }
  /** Native target, initially "". Native submitter formtarget can override it. */
  public get target(): string { return Reflect.get(HTMLFormElement.prototype, "target", this.native) as string }
  public set target(value: string) { text(value); this.#attribute("target", value) }
  /** Native flag initially false. Does not suppress explicit validate/checkValidity/reportValidity. */
  public get noValidate(): boolean { return Reflect.get(HTMLFormElement.prototype, "noValidate", this.native) as boolean }
  public set noValidate(value: boolean) { if (typeof value !== "boolean") throw new TypeError("Expected a boolean."); this.#attribute("novalidate", value ? "" : null) }
  /** Native autocomplete is on when absent. */
  public get autocomplete(): AutoFillBase { return Reflect.get(HTMLFormElement.prototype, "autocomplete", this.native) as AutoFillBase }
  public set autocomplete(value: AutoFillBase) { if (!["on", "off"].includes(value)) throw new RangeError("Invalid autocomplete."); this.#attribute("autocomplete", value) }
  /** Native form name, initially ""; distinct from individual control names. */
  public get name(): string { return Reflect.get(HTMLFormElement.prototype, "name", this.native) as string }
  public set name(value: string) { text(value); this.#attribute("name", value) }
  /** Native accept-charset string, initially ""; encoding support remains browser-owned. */
  public get acceptCharset(): string { return Reflect.get(HTMLFormElement.prototype, "acceptCharset", this.native) as string }
  public set acceptCharset(value: string) { text(value); this.#attribute("accept-charset", value) }
  /** Native relationship tokens, initially "". */
  public get rel(): string { return Reflect.get(HTMLFormElement.prototype, "rel", this.native) as string }
  public set rel(value: string) { text(value); this.#attribute("rel", value) }
  /** Live native association, including external controls and excluding controls owned by another form. */
  public get elements(): HTMLFormControlsCollection { return Reflect.get(HTMLFormElement.prototype, "elements", this.native) as HTMLFormControlsCollection }
  public get length(): number { return this.elements.length }
  public get validateOnBlur(): boolean { return this.hasAttribute("validate-on-blur") }
  public set validateOnBlur(value: boolean) { this.setBooleanAttribute("validate-on-blur", value) }
  public get inline(): boolean { return this.hasAttribute("inline") }
  public set inline(value: boolean) { this.setBooleanAttribute("inline", value) }
  /** Explicit native mappings, or null (initially) to discover keyed items through actual form association.
   * Keys are literal, not model paths. No model, schema or automatic submit pipeline is provided.
   */
  public get items(): readonly FormItemOptions[] | null { return this.#items }
  public set items(value: readonly FormItemOptions[] | null) {
    if (value !== null && (!Array.isArray(value) || value.some(item => !item || !Array.isArray(item.controls)))) throw new TypeError("Expected native item mappings or null.")
    this.#items = value === null ? null : value.map(item => ({ ...item, controls: [...item.controls] }))
    this.#controller?.disconnect(); this.#controller = undefined
    if (this.#initialized && this.isConnected) this.refresh()
  }
  /** Validation coordinator state; native methods remain available when disconnected. */
  public get connected(): boolean { return this.#controller?.connected ?? false }
  /** Latest anatomy/setup failure, otherwise null. Validator failures reject and emit on the native form. */
  public get error(): unknown { return this.#error }
  #collect(): readonly FormItemOptions[] {
    if (this.#items !== null) return this.#items
    const groups = new Map<FormItem, FormControl[]>()
    for (const node of this.elements) {
      if (!["input", "select", "textarea"].includes(node.localName)) continue
      const item = node.closest<FormItem>("m-form-item,m-form-item-gi")
      if (!item?.key) continue
      const controls = groups.get(item) ?? []
      controls.push(node as FormControl); groups.set(item, controls)
    }
    return [...groups].map(([item, controls]) => {
      item.refresh()
      return { key: item.key, controls, element: item.native,
        ...(item.feedback ? { feedback: item.feedback } : {}), ...(item.validator ? { validator: item.validator } : {}) }
    })
  }
  /** Invalidate validation and reconcile native owners, items and associations after application edits.
   * Explicit mappings must remain valid. Automatic DOM reconciliation does not erase settled feedback.
   */
  public refresh(): void { this.#reconcile(true) }
  #reconcile(reset: boolean): void {
    if (!this.isConnected) return
    this.#observer?.disconnect()
    try {
      const native = this.native
      for (const [attribute, allowed] of [["method", methods], ["enctype", encodings], ["autocomplete", ["on", "off"]]] as const) {
        if (this.hasAttribute(attribute) && !(allowed as readonly string[]).includes(this.getAttribute(attribute)!)) throw new RangeError(`Invalid ${attribute}.`)
      }
      native.classList.add("m-form")
      for (const [attribute, value] of [["data-size", this.size], ["data-label-placement", this.labelPlacement], ["data-inline", this.inline ? "" : null]] as const) {
        const current = native.getAttribute(attribute), record = this.#presentation.get(attribute)
        if (value !== null) {
          if (record?.last === value) continue
          if (!record || current !== record.last) this.#presentation.set(attribute, { before: current, last: value })
          else record.last = value
          if (current !== value) native.setAttribute(attribute, value)
        } else if (record) {
          if (current === record.last) {
            if (record.before === null) native.removeAttribute(attribute)
            else native.setAttribute(attribute, record.before)
          }
          this.#presentation.delete(attribute)
        }
      }
      const mapping = this.#collect()
      const changed = mapping.length !== this.#mapping.length || mapping.some((item, index) => {
        const previous = this.#mapping[index]!
        return item.key !== previous.key || item.element !== previous.element || item.feedback !== previous.feedback
          || item.validator !== previous.validator || item.controls.length !== previous.controls.length
          || item.controls.some((control, i) => control !== previous.controls[i])
      })
      if (!this.#paused && (!this.connected || changed || this.#blur !== this.validateOnBlur)) {
        this.#controller?.disconnect(); this.#controller = undefined
        this.#controller = coordinateForm(native, { items: mapping, validateOnBlur: this.validateOnBlur })
        this.#mapping = mapping; this.#blur = this.validateOnBlur
      } else if (reset) this.#controller?.refresh()
      this.#error = null
    } catch (error) { this.#controller?.disconnect(); this.#controller = undefined; this.#error = error; throw error }
    finally {
      this.#observer ??= new MutationObserver(() => this.#attempt())
      if (!this.#paused) this.#observer.observe(this.ownerDocument, { childList: true, subtree: true, attributes: true, attributeFilter: ["form", "id", "key"] })
    }
  }
  #attempt(): void {
    const previous = this.#error
    try { this.#reconcile(false) } catch (error) {
      if (String(previous) !== String(error)) this.emit("m:form-error", { key: null, error }, { bubbles: false })
    }
  }
  /** Frozen snapshots; stale or superseded results cannot authorize later work. Does not focus or submit. */
  public async validate(options?: { keys?: readonly string[]; reason?: FormValidationReason }): Promise<FormValidationResult> {
    this.#reconcile(false)
    if (!this.#controller) throw new Error("Form is disconnected.")
    return this.#controller.validate(options)
  }
  public validateField(key: string): Promise<FormValidationResult> { return this.validate({ keys: [key] }) }
  public restoreValidation(): void { this.#controller?.restoreValidation() }
  /** Release validation listeners/feedback, leaving native behavior intact. Reconnecting resumes coordination. */
  public disconnect(): void { this.#paused = true; this.#observer?.disconnect(); this.#controller?.disconnect(); this.#controller = undefined }
  public checkValidity(): boolean { this.#reconcile(false); return HTMLFormElement.prototype.checkValidity.call(this.native) }
  public reportValidity(): boolean { this.#reconcile(false); return HTMLFormElement.prototype.reportValidity.call(this.native) }
  /** Native interactive submission: constraints, invalid events/focus, then cancelable submit.
   * Pass a real associated native submit button; its overrides and name/value remain authoritative.
   */
  public requestSubmit(submitter?: HTMLElement): void { this.#reconcile(false); HTMLFormElement.prototype.requestSubmit.call(this.native, submitter) }
  /** Native direct submission bypasses validation and the submit event; no submitter is included. */
  public submit(): void { HTMLFormElement.prototype.submit.call(this.native) }
  /** Native cancelable reset, then default state restoration. Never writes current control values itself. */
  public reset(): void { HTMLFormElement.prototype.reset.call(this.native) }
}
