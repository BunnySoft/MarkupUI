export type InputOtpCharacters = "digits" | "alphanumeric"
export interface InputOtpOptions {
  length?: number
  characters?: InputOtpCharacters
  status?: HTMLElement
}
export interface InputOtpController {
  readonly input: HTMLInputElement
  readonly length: number
  readonly characters: InputOtpCharacters
  readonly connected: boolean
  readonly complete: boolean
  refresh(): void
  disconnect(): void
}

const owner = Symbol.for("markup-ui.input-otp.owner")
type Owned = Element & { [owner]?: InputOtpController }

/** Observes one native code field. Never edits, normalizes, submits or publishes its value. */
export function createInputOtp(input: HTMLInputElement, options: InputOtpOptions = {}): InputOtpController {
  const document = input?.ownerDocument, view = document?.defaultView
  if (!view || !(input instanceof view.HTMLInputElement)) throw new TypeError("Input OTP needs one native input.")
  if (!options || typeof options !== "object" || Array.isArray(options) || Object.keys(options).some(key => !["length", "characters", "status"].includes(key))
    || options.length !== undefined && typeof options.length !== "number"
    || options.characters !== undefined && typeof options.characters !== "string"
    || options.status !== undefined && !(options.status instanceof view.HTMLElement)) {
    throw new TypeError("Unsupported Input OTP options.")
  }
  const length = options.length ?? 6, characters = options.characters ?? "digits", status = options.status
  if (!Number.isInteger(length) || length < 1 || length > 12 || !["digits", "alphanumeric"].includes(characters)) {
    throw new TypeError("Use a length from 1 to 12 and digits or alphanumeric ASCII characters.")
  }
  const pattern = `${characters === "digits" ? "[0-9]" : "[A-Za-z0-9]"}{${length}}`
  const allowed = new RegExp(`^(?:${pattern})$`)
  function anatomy() {
    return input.isConnected && input.getRootNode() === document && ["text", "password"].includes(input.type)
      && input.maxLength === length && input.getAttribute("pattern") === pattern
      && /^(?:section-\S+ )?one-time-code$/.test((input.getAttribute("autocomplete") ?? "").trim().toLowerCase().split(/\s+/).join(" "))
      && !["role", "aria-expanded", "aria-activedescendant"].some(name => input.hasAttribute(name))
      && (!status || status instanceof view!.HTMLElement && status !== input && status.isConnected
        && status.getRootNode() === document && ["span", "p", "div"].includes(status.localName) && !status.children.length
        && !status.isContentEditable && !["role", "aria-live", "tabindex"].some(name => status.hasAttribute(name))
        && !status.closest('label, button, a[href], [aria-live]:not([aria-live="off" i]), [role~="alert" i], [role~="status" i], [role~="log" i]'))
  }
  if (!anatomy()) throw new TypeError("Author a connected text/password input with matching maxlength, ASCII pattern, one-time-code autocomplete and optional plain nonlive status.")
  const nodes = [input, ...(status ? [status] : [])]
  for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Input OTP node already has an owner.")
  let connected = true, composing = false, compositionGeneration = 0, generation = 0
  let timer: number | null = null
  const removers: (() => void)[] = []
  let reset: { event: Event; composition: number } | null = null
  function structural() { return input.value.length === length && allowed.test(input.value) && input.validity.valid }
  function boundary() {
    return { form: input.form, type: input.type, name: input.name, required: input.required, minLength: input.minLength,
      available: !input.matches(":disabled") && !input.readOnly && !input.closest("[hidden], [inert]") }
  }
  function sameBoundary(a: ReturnType<typeof boundary>, b: ReturnType<typeof boundary>) {
    return a.form === b.form && a.type === b.type && a.name === b.name && a.required === b.required
      && a.minLength === b.minLength && a.available === b.available
  }
  let observed = boundary(), completed = structural()
  let text: { before: string; last: string } | null = null
  let attribute: { before: string | null; last: string | null } | null = null
  function present() {
    if (!status) return
    const beforeText = status.textContent ?? "", beforeAttribute = status.getAttribute("data-input-otp-state")
    if (!text) text = { before: beforeText, last: beforeText }
    if (!attribute) attribute = { before: beforeAttribute, last: beforeAttribute }
    if (beforeText !== text.last) text.before = beforeText
    if (beforeAttribute !== attribute.last) attribute.before = beforeAttribute
    const count = input.value.length, full = !composing && structural()
    const state = composing ? "editing" : full ? "complete" : count === 0 ? "empty" : count < length ? "partial" : "invalid"
    const message = `${count} / ${length} characters entered.${full ? " Format complete; not authenticated." : ""}`
    status.textContent = message; text.last = message
    status.setAttribute("data-input-otp-state", state); attribute.last = state
  }
  function cancel() {
    generation++
    if (timer !== null) view!.clearTimeout(timer)
    timer = null
  }
  function settleReset(editing = false) {
    const previous = reset
    if (!previous || previous.event.eventPhase !== 0) return
    reset = null
    if (previous.event.defaultPrevented) return
    if (!anatomy()) { disconnect(); return }
    cancel()
    if (previous.composition === compositionGeneration) composing = false
    // A subsequent input already contains a new edit; classify the reset default, not that edit.
    completed = editing || composing
      ? input.defaultValue.length === length && allowed.test(input.defaultValue) && input.validity.valid
      : structural()
    observed = boundary()
    present()
  }
  function refresh() {
    if (!connected) return
    settleReset()
    cancel()
    if (!anatomy()) { disconnect(); return }
    observed = boundary()
    if (!composing) completed = structural()
    present()
  }
  function changed() {
    if (!connected) return
    cancel()
    if (!anatomy()) { disconnect(); return }
    if (!sameBoundary(observed, boundary())) { refresh(); return }
    if (composing) { present(); return }
    if (!structural()) completed = false
    // This short-lived snapshot guards silent writes between the event and its deferred check.
    const value = input.value, version = generation, before = boundary()
    present()
    timer = view!.setTimeout(() => {
      timer = null
      if (!connected || generation !== version || composing) return
      if (!anatomy()) { disconnect(); return }
      if (input.value !== value || !sameBoundary(before, boundary())) { refresh(); return }
      const full = structural(), notify = full && !completed && before.available
      completed = full; observed = boundary(); present()
      if (notify) input.dispatchEvent(new view!.CustomEvent("mui:input-otp-complete", {
        detail: Object.freeze({ length, characters }),
      }))
    }, 0)
  }
  function listen(node: EventTarget, type: string, listener: EventListener, capture = false) {
    node.addEventListener(type, listener, capture); removers.push(() => node.removeEventListener(type, listener, capture))
  }
  const observer = new view.MutationObserver(records => {
    if (!anatomy()) { disconnect(); return }
    if (!sameBoundary(observed, boundary()) || records.some(record => record.target === input && record.attributeName === "value")) refresh()
  })
  function disconnect() {
    if (!connected) return
    connected = false; observer.disconnect(); cancel()
    removers.splice(0).forEach(remove => remove())
    reset = null
    if (text && status?.textContent === text.last) status.textContent = text.before
    if (attribute && status?.getAttribute("data-input-otp-state") === attribute.last) {
      if (attribute.before === null) status.removeAttribute("data-input-otp-state")
      else status.setAttribute("data-input-otp-state", attribute.before)
    }
    text = attribute = null
    for (const node of nodes) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
  }
  const api: InputOtpController = { input, length, characters, get connected() { return connected },
    get complete() { return connected && !composing && anatomy() && structural() }, refresh, disconnect }
  for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
  listen(input, "input", event => { settleReset(true); if ((event as InputEvent).isComposing) composing = true; changed() })
  listen(input, "change", () => { settleReset(true); changed() })
  listen(input, "compositionstart", () => {
    settleReset(true)
    if (!connected) return
    if (!anatomy()) { disconnect(); return }
    compositionGeneration++; composing = true; cancel(); present()
  })
  listen(input, "compositionend", () => { settleReset(true); compositionGeneration++; composing = false; changed() })
  listen(document!, "reset", event => {
    if (event.target !== input.form) return
    settleReset()
    const pending = { event, composition: compositionGeneration }
    reset = pending
    view!.queueMicrotask(() => { if (connected && reset === pending) settleReset() })
  }, true)
  observer.observe(document!, { childList: true, subtree: true, attributes: true,
    attributeFilter: ["id", "form", "name", "type", "disabled", "readonly", "hidden", "inert", "required", "minlength",
      "maxlength", "pattern", "autocomplete", "value", "role", "aria-expanded", "aria-activedescendant", "aria-live", "tabindex", "contenteditable"] })
  present()
  return api
}
