export type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
export type FormValidationControl = FormControl | HTMLButtonElement | HTMLObjectElement | HTMLFieldSetElement | HTMLOutputElement
export type FormValidationReason = "manual" | "blur" | "submit"
export interface FormFieldSnapshot {
  readonly control: FormControl
  readonly name: string
  readonly value: string
  readonly checked: boolean
  readonly values: readonly string[]
  readonly files: readonly File[]
  readonly eligible: boolean
}
export interface FormValidatorContext {
  readonly form: HTMLFormElement
  readonly key: string
  readonly controls: readonly FormControl[]
  readonly fields: readonly FormFieldSnapshot[]
  readonly signal: AbortSignal
  readonly reason: FormValidationReason
}
export type FormValidatorResult = null | { message: string; level?: "error" | "warning" }
export type FormValidator = (context: FormValidatorContext) => FormValidatorResult | Promise<FormValidatorResult>
export interface FormItemOptions {
  key: string
  controls: readonly FormControl[]
  element?: HTMLElement
  feedback?: HTMLElement
  validator?: FormValidator
}
export interface FormOptions {
  items: readonly FormItemOptions[]
  validateOnBlur?: boolean
}
export interface FormIssue {
  readonly key: string | null
  readonly control: FormValidationControl
  readonly message: string
  readonly source: "native" | "custom" | "warning"
}
export interface FormValidationResult {
  readonly status: "valid" | "invalid" | "aborted"
  readonly issues: readonly FormIssue[]
  /** Recheck immediately before consuming the result; edits and newer validation invalidate it. */
  readonly current: boolean
}
export interface FormController {
  readonly form: HTMLFormElement
  readonly connected: boolean
  validate(options?: { keys?: readonly string[]; reason?: FormValidationReason }): Promise<FormValidationResult>
  validateField(key: string): Promise<FormValidationResult>
  restoreValidation(): void
  refresh(): void
  reportValidity(): boolean
  disconnect(): void
}

const owner = Symbol.for("markup-ui.form.owner")
type Owned = Element & { [owner]?: FormController }
interface Attribute { node: Element; name: string; before: string | null; last: string | null }
interface Item {
  key: string
  controls: readonly FormControl[]
  element: HTMLElement | undefined
  feedback: HTMLElement | undefined
  feedbackId: string | undefined
  validator: FormValidator | undefined
  attributes: Attribute[]
  tokens: Set<FormControl>
  text: { before: string; last: string } | null
  pending: boolean
}
interface Snapshot { nodes: Element[]; states: string[]; fields: readonly FormFieldSnapshot[] }

/** Coordinates explicit native fields. Never submits, sets values/defaults, or disables native validation. */
export function createForm(form: HTMLFormElement, options: FormOptions): FormController {
  const document = form?.ownerDocument, view = document?.defaultView
  if (!view || !(form instanceof view.HTMLFormElement) || !form.isConnected || form.getRootNode() !== document) {
    throw new TypeError("Form needs a connected light-DOM native form.")
  }
  if (!options || Object.keys(options).some(key => !["items", "validateOnBlur"].includes(key))
    || !Array.isArray(options.items) || options.validateOnBlur !== undefined && typeof options.validateOnBlur !== "boolean") {
    throw new TypeError("Form needs explicit items and optional validateOnBlur.")
  }
  function isControl(node: unknown): node is FormControl {
    return node instanceof view!.HTMLInputElement || node instanceof view!.HTMLSelectElement || node instanceof view!.HTMLTextAreaElement
  }
  function isValidatable(node: Element): node is FormValidationControl {
    return isControl(node) || node instanceof view!.HTMLButtonElement || node instanceof view!.HTMLObjectElement
      || node instanceof view!.HTMLFieldSetElement || node instanceof view!.HTMLOutputElement
  }
  const validateOnBlur = options.validateOnBlur ?? false
  const nodes = new Set<Element>([form]), keys = new Set<string>()
  const items: Item[] = options.items.map(item => {
    if (!item || Object.keys(item).some(key => !["key", "controls", "element", "feedback", "validator"].includes(key))
      || typeof item.key !== "string" || !item.key || keys.has(item.key) || !Array.isArray(item.controls)
      || !item.controls.length || item.validator !== undefined && typeof item.validator !== "function") {
      throw new TypeError("Each Form item needs a unique nonempty literal key, controls and an optional validator.")
    }
    keys.add(item.key)
    for (const node of [...item.controls, item.element, item.feedback]) if (node) {
      if (!(node instanceof view.HTMLElement) || nodes.has(node)) throw new TypeError("Form item nodes must be distinct, with one mapping per control.")
      nodes.add(node)
    }
    if (item.controls.some((control: unknown) => !isControl(control))) throw new TypeError("Map native input/select/textarea, not fieldset validity.")
    return { key: item.key, controls: Object.freeze([...item.controls]), element: item.element,
      feedback: item.feedback, feedbackId: item.feedback?.id, validator: item.validator,
      attributes: [], tokens: new Set(), text: null, pending: false }
  })
  function anatomy() {
    if (!form.isConnected || form.getRootNode() !== document) return false
    return items.every(item => item.controls.every(control => control.isConnected && control.form === form && control.getRootNode() === document)
      && (!item.element || item.element.isConnected && item.element.getRootNode() === document)
      && (!item.feedback || item.feedback.isConnected && item.feedback.getRootNode() === document
        && ["span", "p", "div"].includes(item.feedback.localName) && !item.feedback.children.length
        && !!item.feedbackId && !/\s/.test(item.feedbackId) && item.feedback.id === item.feedbackId
        && [...document!.querySelectorAll("[id]")].filter(node => node.id === item.feedbackId).length === 1
        && !item.feedback.hasAttribute("role") && !item.feedback.hasAttribute("aria-live")
        && !item.feedback.hasAttribute("tabindex") && !item.feedback.isContentEditable
        && !item.feedback.closest("label, button, a[href]")))
  }
  if (!anatomy()) throw new TypeError("Keep mapped fields associated with the form and feedback uniquely identified, plain, nonlive and noninteractive.")
  for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Form node already has an owner.")
  let connected = true, generation = 0, running: AbortController | null = null
  const removers: (() => void)[] = []
  const timers = new Set<number>()
  function nativeControls() { return [...form.elements].filter(isControl) }
  function snapshot(): Snapshot {
    const controls = nativeControls()
    const fields = Object.freeze(controls.map(control => Object.freeze({
      control, name: control.name, value: control.value,
      checked: control instanceof view!.HTMLInputElement && control.checked,
      values: Object.freeze(control instanceof view!.HTMLSelectElement ? [...control.selectedOptions].map(option => option.value) : [control.value]),
      files: Object.freeze(control instanceof view!.HTMLInputElement ? [...control.files ?? []] : []),
      eligible: control.willValidate,
    })))
    return { nodes: [form, ...form.elements], fields, states: [
      String(form.noValidate),
      ...[...form.elements].map(node => {
        const control = isControl(node) ? node : null
        const validity = isValidatable(node) ? node : null
        return JSON.stringify([
          [...node.attributes].filter(attr => ["name", "type", "form", "disabled", "readonly", "required", "min", "max", "step", "pattern", "minlength", "maxlength", "multiple", "formnovalidate", "value"].includes(attr.name)).map(attr => [attr.name, attr.value]),
          control?.value, control?.willValidate, control?.matches(":disabled"),
          control instanceof view!.HTMLInputElement ? control.checked : null,
          control instanceof view!.HTMLSelectElement ? [...control.options].map(option => [option.value, option.selected, option.disabled, option.parentElement?.hasAttribute("disabled")]) : null,
          validity?.willValidate, validity?.validity.customError, validity?.validationMessage,
        ])
      }),
    ] }
  }
  function equal(a: Snapshot, b: Snapshot) {
    return a.nodes.length === b.nodes.length && a.nodes.every((node, index) => node === b.nodes[index])
      && a.states.every((state, index) => state === b.states[index])
      && a.fields.every((field, index) => field.files.length === b.fields[index]?.files.length
        && field.files.every((file, fileIndex) => file === b.fields[index]?.files[fileIndex]))
  }
  let observed = snapshot()
  function write(item: Item, node: Element, name: string, value: string | null) {
    let record = item.attributes.find(record => record.node === node && record.name === name)
    const current = node.getAttribute(name)
    if (!record) { record = { node, name, before: current, last: current }; item.attributes.push(record) }
    if (current !== record.last) record.before = current
    if (value === null) node.removeAttribute(name)
    else node.setAttribute(name, value)
    record.last = value
  }
  function restoreItem(item: Item) {
    for (const control of item.tokens) {
      const tokens = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(token => token && token !== item.feedbackId)
      if (tokens.length) control.setAttribute("aria-describedby", tokens.join(" "))
      else control.removeAttribute("aria-describedby")
    }
    item.tokens.clear()
    for (const record of item.attributes) if (record.node.getAttribute(record.name) === record.last) {
      if (record.before === null) record.node.removeAttribute(record.name)
      else record.node.setAttribute(record.name, record.before)
    }
    item.attributes.length = 0
    if (item.text && item.feedback?.textContent === item.text.last) item.feedback.textContent = item.text.before
    item.text = null; item.pending = false
  }
  function abort() {
    generation++
    const previous = running; running = null
    previous?.abort()
    for (const item of items) if (item.pending) restoreItem(item)
  }
  function restoreValidation() {
    abort()
    items.forEach(restoreItem)
    observed = snapshot()
  }
  function refresh() {
    if (!connected) return
    restoreValidation()
    if (!anatomy()) disconnect()
  }
  function sync() {
    if (!connected) return
    if (!anatomy()) { disconnect(); return }
    const current = snapshot()
    if (!equal(observed, current)) restoreValidation()
  }
  function present(item: Item, issues: readonly FormIssue[]) {
    item.pending = false
    const error = issues.some(issue => issue.source !== "warning")
    if (item.element) write(item, item.element, "data-form-status", error ? "error" : issues.length ? "warning" : "success")
    if (!issues.length) return
    for (const control of item.controls.filter(control => control.willValidate)) {
      if (error) write(item, control, "aria-invalid", "true")
      if (item.feedback) {
        const tokens = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean)
        if (!tokens.includes(item.feedbackId!)) {
          tokens.push(item.feedbackId!); item.tokens.add(control)
          control.setAttribute("aria-describedby", tokens.join(" "))
        }
      }
    }
    if (item.feedback) {
      const current = item.feedback.textContent ?? ""
      if (!item.text) item.text = { before: current, last: current }
      if (current !== item.text.last) item.text.before = current
      const message = [...new Set(issues.map(issue => issue.message))].join("\n")
      item.feedback.textContent = message; item.text.last = message
      write(item, item.feedback, "hidden", null)
    }
  }
  function nativeIssues(controls: readonly FormValidationControl[], key: string | null): FormIssue[] {
    return controls.filter(control => control.willValidate && !control.validity.valid)
      .map(control => ({ key, control, message: control.validationMessage, source: "native" }))
  }
  function report(error: unknown, key: string) {
    form.dispatchEvent(new view!.CustomEvent("mui:form-error", { detail: { key, error } }))
  }
  async function custom(item: Item, context: FormValidatorContext, signal: AbortSignal) {
    let remove = () => {}
    const cancelled = new Promise<null>(resolve => {
      const handler = () => resolve(null)
      signal.addEventListener("abort", handler, { once: true })
      remove = () => signal.removeEventListener("abort", handler)
      if (signal.aborted) resolve(null)
    })
    const validation = Promise.resolve().then(() => {
      if (signal.aborted) return null
      return item.validator!(context)
    }).then(result => {
      if (result !== null && (typeof result !== "object" || Array.isArray(result)
        || Object.keys(result).some(key => !["message", "level"].includes(key))
        || typeof result.message !== "string" || !result.message.trim()
        || result.level !== undefined && !["error", "warning"].includes(result.level))) {
        throw new TypeError("Validator must return null or { message, level?: 'error' | 'warning' }.")
      }
      return result
    }).catch(error => {
      if (signal.aborted && error instanceof view!.DOMException && error.name === "AbortError") return null
      report(error, item.key)
      throw error
    })
    try { return await Promise.race([validation, cancelled]) } finally { remove() }
  }
  async function validate(settings: { keys?: readonly string[]; reason?: FormValidationReason } = {}): Promise<FormValidationResult> {
    if (!settings || Object.keys(settings).some(key => !["keys", "reason"].includes(key))
      || settings.keys !== undefined && (!Array.isArray(settings.keys) || settings.keys.some(key => !keys.has(key)))
      || settings.reason !== undefined && !["manual", "blur", "submit"].includes(settings.reason)) throw new TypeError("Use mapped literal keys and a supported validation reason.")
    sync()
    if (!connected) throw new Error("Form is disconnected; recreate changed mappings.")
    abort()
    const selected = settings.keys === undefined ? items : items.filter(item => settings.keys!.includes(item.key))
    selected.forEach(restoreItem)
    const controller = new view!.AbortController(), signal = controller.signal, version = generation
    running = controller
    const before = snapshot()
    observed = before
    const current = () => connected && !signal.aborted && generation === version && anatomy() && equal(before, snapshot())
    function result(status: FormValidationResult["status"], issues: readonly FormIssue[]): FormValidationResult {
      return Object.freeze({ status, issues: Object.freeze(issues.map(issue => Object.freeze(issue))), get current() { return status !== "aborted" && current() } })
    }
    try {
      const results = await Promise.all(selected.map(async item => {
        const issues = nativeIssues(item.controls, item.key)
        const anchor = item.controls.find(control => control.willValidate)
        if (!issues.length && anchor && item.validator) {
          item.pending = true
          if (item.element) write(item, item.element, "data-form-status", "pending")
          const value = await custom(item, Object.freeze({ form, key: item.key, controls: item.controls,
            fields: before.fields, signal, reason: settings.reason ?? "manual" }), signal)
          if (value) issues.push({ key: item.key, control: anchor, message: value.message, source: value.level === "warning" ? "warning" : "custom" })
        }
        return { item, issues }
      }))
      if (!current()) {
        if (generation === version) refresh()
        return result("aborted", [])
      }
      const issues = results.flatMap(entry => entry.issues)
      if (settings.keys === undefined) issues.push(...nativeIssues([...form.elements].filter(isValidatable)
        .filter(control => !items.some(item => item.controls.some(member => member === control))), null))
      for (const { item, issues: messages } of results) {
        present(item, messages)
      }
      running = null
      observed = snapshot()
      return result(issues.some(issue => issue.source !== "warning") ? "invalid" : "valid", issues)
    } catch (error) {
      if (generation === version) restoreValidation()
      throw error
    }
  }
  function listen(node: EventTarget, type: string, listener: EventListener) {
    node.addEventListener(type, listener, true); removers.push(() => node.removeEventListener(type, listener, true))
  }
  const observer = new view.MutationObserver(sync)
  function disconnect() {
    if (!connected) return
    connected = false
    observer.disconnect(); restoreValidation()
    removers.splice(0).forEach(remove => remove())
    timers.forEach(id => view!.clearTimeout(id)); timers.clear()
    for (const node of nodes) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
  }
  const api: FormController = { form, get connected() { return connected },
    validate, validateField: key => validate({ keys: [key] }), restoreValidation, refresh, disconnect,
    reportValidity() {
      sync()
      if (!connected) throw new Error("Form is disconnected.")
      return form.reportValidity()
    },
  }
  for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
  for (const type of ["input", "change", "mui:rate-clear"]) listen(document!, type, event => {
    const target = event.target
    if (isControl(target) && target.form === form
      || target instanceof view!.Element && nativeControls().some(control => target.contains(control))) restoreValidation()
  })
  listen(document!, "focusout", event => {
    if (!validateOnBlur) return
    sync()
    if (!connected) return
    const item = items.find(item => item.controls.includes(event.target as FormControl))
    if (item && !item.controls.includes((event as FocusEvent).relatedTarget as FormControl)) {
      // validate reports unexpected validator failures; event-triggered work has no caller promise.
      void validate({ keys: [item.key], reason: "blur" }).catch(() => {})
    }
  })
  listen(document!, "invalid", event => {
    const item = items.find(item => item.controls.includes(event.target as FormControl))
    if (item) { abort(); present(item, nativeIssues(item.controls, item.key)) }
  })
  listen(form, "reset", event => {
    // Cancel work immediately, but preserve settled feedback when reset is cancelled.
    abort()
    const version = generation
    const id = view!.setTimeout(() => {
      timers.delete(id)
      if (connected && generation === version && !event.defaultPrevented) refresh()
    }, 0)
    timers.add(id)
  })
  observer.observe(document!, { subtree: true, childList: true, attributes: true,
    attributeFilter: ["id", "name", "form", "type", "disabled", "readonly", "required", "min", "max", "step", "pattern", "minlength", "maxlength", "multiple", "selected", "checked", "value", "novalidate", "formnovalidate", "role", "aria-live", "tabindex", "contenteditable"] })
  return api
}
