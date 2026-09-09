export type InputControl = HTMLInputElement | HTMLTextAreaElement
export interface InputCount { value: string; length: number; maxLength: number | null }
export interface InputOptions { formatCount?: (count: InputCount) => string }
export interface InputController {
  readonly control: InputControl
  readonly connected: boolean
  refresh(): void
  setValue(value: string, options?: { emit?: boolean }): void
  clear(): boolean
  disconnect(): void
}

const owner = Symbol.for("markup-ui.input.owner")
type Owned = Element & { [owner]?: InputController }
const textTypes = new Set(["text", "password", "search", "email", "tel", "url"])
interface Attribute { node: Element; name: string; before: string | null; base: string | null; last: string | null }

/** Enhances one authored native field; never creates or replaces a form control. */
export function createInput(root: HTMLElement, options: InputOptions = {}): InputController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches(".mui-input[data-input]")
    || !root.isConnected || root.getRootNode() !== document || root.hasAttribute("role") || root.hasAttribute("tabindex")) {
    throw new TypeError("Input needs a connected light-DOM .mui-input[data-input] without role or tabindex.")
  }
  if (!options || typeof options !== "object" || Object.keys(options).some(key => key !== "formatCount")
    || options.formatCount !== undefined && typeof options.formatCount !== "function") throw new TypeError("Unsupported Input options.")
  if ((root as Owned)[owner]) throw new Error("Input root already has an owner.")
  const own = (node: Element) => node.closest("[data-input]") === root
  function one(selector: string, required = false): HTMLElement | null {
    const nodes = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length > 1 || required && nodes.length !== 1) throw new TypeError(`Input needs ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] ?? null
  }
  const field = one("[data-input-control]", true)
  if (!(field instanceof view.HTMLInputElement || field instanceof view.HTMLTextAreaElement)
    || field instanceof view.HTMLInputElement && !textTypes.has(field.type)) throw new TypeError("Input helpers support textarea and text/password/search/email/tel/url only.")
  const control: InputControl = field
  if ((control as Owned)[owner]) throw new Error("Native control already has an Input owner.")
  const clearButton = one("[data-input-clear]") as HTMLButtonElement | null
  const revealButton = one("[data-input-reveal]") as HTMLButtonElement | null
  const count = one("[data-input-count]")
  function named(node: HTMLElement): boolean {
    const ids = node.getAttribute("aria-labelledby")?.trim().split(/\s+/)
    if (ids?.length) return ids.every(id => !!document!.getElementById(id)?.textContent?.trim())
    return !!(node.getAttribute("aria-label")?.trim()
      || [...(node as InputControl).labels ?? []].some(label => label.textContent?.trim())
      || node.localName === "button" && [...node.childNodes].some(child => child.nodeType === 3
        ? child.textContent?.trim() : child instanceof view!.HTMLElement && !child.hidden
          && child.getAttribute("aria-hidden") !== "true" && child.textContent?.trim()))
  }
  function valid(): boolean {
    return root.isConnected && root.getRootNode() === document && root.matches(".mui-input[data-input]")
      && !root.hasAttribute("role") && !root.hasAttribute("tabindex")
      && [control, clearButton, revealButton, count].every(node => !node || root.contains(node) && own(node))
      && [clearButton, revealButton].every(button => !button || button.localName === "button"
        && button.getAttribute("type")?.toLowerCase() === "button" && !button.hasAttribute("role")
        && !button.hasAttribute("popovertarget") && !button.hasAttribute("commandfor")
        && !button.parentElement?.closest("label, button, a[href], summary"))
      && (control instanceof view!.HTMLTextAreaElement || textTypes.has(control.type))
  }
  function anatomy() {
    if (!valid() || !named(control) || control.hasAttribute("role")) throw new TypeError("Keep the authored native field named and in its original Input root.")
    for (const button of [clearButton, revealButton]) if (button && (!(button instanceof view!.HTMLButtonElement)
      || button.getAttribute("type")?.toLowerCase() !== "button" || !named(button)
      || button.hasAttribute("role") || button.getAttribute("aria-hidden") === "true"
      || button.hasAttribute("popovertarget") || button.hasAttribute("commandfor")
      || button.parentElement?.closest("label, button, a[href], summary")
      || button.querySelector("a, button, input, select, textarea, [tabindex], [contenteditable], [role]"))) {
      throw new TypeError("Input actions need named type=button controls outside labels and other interactive elements.")
    }
    if (count && (count.localName !== "span" || count.children.length || count.hasAttribute("aria-live")
      || count.hasAttribute("role"))) throw new TypeError("Input count needs a text-only span, not a live region.")
  }
  anatomy()
  if (revealButton && (!(control instanceof view.HTMLInputElement) || control.type !== "password")) {
    throw new TypeError("Password reveal requires an authored input[type=password].")
  }
  let connected = true, composing = false, visible = false, generation = 0
  const attributes: Attribute[] = []
  const removers: (() => void)[] = []
  const timers = new Set<number>()
  let countBefore = count?.textContent ?? "", countLast = countBefore
  const formatter = options.formatCount ?? ((data: InputCount) => `${data.length}${data.maxLength === null ? "" : ` / ${data.maxLength}`}`)
  function countText(): string {
    const text = formatter({ value: control.value, length: control.value.length, maxLength: control.maxLength < 0 ? null : control.maxLength })
    if (typeof text !== "string") throw new TypeError("formatCount must return plain text.")
    return text
  }
  if (count) countText()
  function lease(node: Element, name: string, enhancement = false) {
    const before = node.getAttribute(name)
    attributes.push({ node, name, before, base: enhancement ? null : before, last: before })
  }
  for (const button of [clearButton, revealButton]) if (button) {
    lease(button, "hidden", true)
    lease(button, "disabled")
  }
  if (revealButton) { lease(revealButton, "aria-pressed"); lease(control, "type") }
  function attribute(node: Element, name: string) { return attributes.find(item => item.node === node && item.name === name)! }
  function write(node: Element, name: string, value: string | null) {
    const item = attribute(node, name)
    if (node.getAttribute(name) !== value) {
      if (value === null) node.removeAttribute(name)
      else node.setAttribute(name, value)
    }
    item.last = value
  }
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const item = attributes.find(item => item.node === record.target && item.name === record.attributeName)
      if (item) {
        item.before = item.base = item.last = item.node.getAttribute(item.name)
        if (item.node === control && item.name === "type") visible = false
      }
    }
  }
  const observer = new view.MutationObserver(records => {
    mark(records)
    if (!valid()) { disconnect(); return }
    refresh()
  })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    if (!connected) return
    observer.observe(root, { subtree: true, childList: true, attributes: true,
      attributeFilter: ["disabled", "readonly", "hidden", "inert", "type", "maxlength", "value", "form", "aria-pressed"] })
    // Ancestor changes include fieldset inheritance, the first-legend exception, and removal/moves.
    for (let node = root.parentElement; node; node = node.parentElement) {
      observer.observe(node, { childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"] })
    }
  }
  function editable() {
    return connected && valid() && !composing && !control.matches(":disabled") && !control.readOnly
      && !control.closest("[hidden], [inert]")
  }
  function mask() {
    if (!visible) return
    const item = attribute(control, "type")
    if (control.getAttribute("type") === item.last) switchType(item.base)
    visible = false
  }
  function switchType(type: string | null) {
    const start = control.selectionStart, end = control.selectionEnd, direction = control.selectionDirection
    write(control, "type", type)
    if (start !== null && end !== null) {
      try { control.setSelectionRange(start, end, direction ?? undefined) } catch { /* Some native types cannot select. */ }
    }
  }
  function refresh() {
    if (!connected) return
    pause()
    if (!valid()) { disconnect(); return }
    const canEdit = editable()
    if (control.matches(":disabled") || control.readOnly || control.closest("[hidden], [inert]")
      || revealButton && (attribute(revealButton, "disabled").base !== null || attribute(revealButton, "hidden").base !== null
        || revealButton.closest("[hidden], [inert]")
        || revealButton.closest("fieldset:disabled") && revealButton.matches(":disabled"))) mask()
    for (const button of [clearButton, revealButton]) if (button) {
      const hidden = attribute(button, "hidden"), disabled = attribute(button, "disabled")
      const unsupported = button === revealButton && !visible && (control as HTMLInputElement).type !== "password"
      const hide = hidden.base !== null || button === clearButton && !control.value || unsupported
      if (hide && document!.activeElement === button && canEdit) {
        control.focus({ preventScroll: true })
        if (!connected) return
      }
      write(button, "hidden", hide ? hidden.base ?? "" : null)
      write(button, "disabled", !canEdit || unsupported ? disabled.base ?? "" : disabled.base)
    }
    if (revealButton) write(revealButton, "aria-pressed", String(visible))
    try {
      if (count) {
        if (count.textContent !== countLast) countBefore = count.textContent ?? ""
        const text = countText()
        if (count.textContent !== text) count.textContent = text
        countLast = text
      }
    } finally { observe() }
  }
  function notify() {
    control.dispatchEvent(new view!.Event("input", { bubbles: true, composed: true }))
    control.dispatchEvent(new view!.Event("change", { bubbles: true }))
  }
  function setValue(value: string, emitOptions: { emit?: boolean } = {}) {
    refresh()
    if (!connected) throw new Error("Input is disconnected.")
    if (typeof value !== "string") throw new TypeError("setValue needs a string; native defaults are separate.")
    if (composing) throw new view!.DOMException("Do not replace a composing value.", "InvalidStateError")
    const previous = control.value
    control.value = value
    refresh()
    if (emitOptions.emit && control.value !== previous) notify()
  }
  function clear(): boolean {
    if (!editable() || !control.value) return false
    const previous = control.value
    if (document!.activeElement === clearButton) control.focus({ preventScroll: true })
    if (!editable()) return false
    setValue("")
    notify()
    control.dispatchEvent(new view!.CustomEvent("mui:input-clear", { bubbles: true, detail: { previous } }))
    return true
  }
  function listen(node: EventTarget, type: string, handler: EventListener, capture = false) {
    node.addEventListener(type, handler, capture)
    removers.push(() => node.removeEventListener(type, handler, capture))
  }
  function conceal() {
    if (!connected) return
    generation++
    pause(); mask(); refresh()
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => { timers.delete(id); if (connected) callback() }, 0)
    timers.add(id)
  }
  listen(control, "input", refresh)
  listen(control, "change", refresh)
  listen(control, "compositionstart", () => { composing = true; refresh() })
  listen(control, "compositionend", () => { composing = false; refresh() })
  if (clearButton) listen(clearButton, "click", event => {
    later(() => { if (!event.defaultPrevented && !clearButton.disabled && !clearButton.hidden && !clearButton.matches(":disabled")) clear() })
  })
  if (revealButton) listen(revealButton, "click", event => {
    const pending = generation
    later(() => {
      pause()
      if (pending === generation && !event.defaultPrevented && editable() && !revealButton.disabled && !revealButton.hidden
        && !revealButton.matches(":disabled") && (visible || (control as HTMLInputElement).type === "password")) {
        if (visible) mask()
        else { switchType("text"); visible = true }
      }
      refresh()
    })
  })
  listen(root, "focusout", event => { if (!root.contains((event as FocusEvent).relatedTarget as Node | null)) conceal() })
  listen(root, "keydown", event => { if ((event as KeyboardEvent).key === "Escape") conceal() })
  listen(root, "pointercancel", conceal)
  listen(view, "blur", conceal)
  listen(view, "pagehide", conceal)
  listen(view, "beforeprint", conceal)
  listen(document!, "visibilitychange", () => { if (document!.hidden) conceal() })
  listen(document!, "reset", event => {
    if (event.target !== control.form) return
    // A task runs after the browser's reset default action, including cancelled resets.
    later(() => { if (!event.defaultPrevented) { composing = false; conceal() } else refresh() })
  }, true)
  function disconnect() {
    if (!connected) return
    pause(); mask()
    connected = false
    removers.splice(0).forEach(remove => remove())
    timers.forEach(id => view!.clearTimeout(id)); timers.clear()
    for (const item of attributes.reverse()) if (item.node.getAttribute(item.name) === item.last) {
      if (item.before === null) item.node.removeAttribute(item.name)
      else item.node.setAttribute(item.name, item.before)
    }
    if (count?.textContent === countLast) count.textContent = countBefore
    for (const node of [root, control] as Owned[]) if (node[owner] === controller) delete node[owner]
  }
  const controller: InputController = { control, get connected() { return connected }, refresh, setValue, clear, disconnect }
  for (const node of [root, control]) Object.defineProperty(node, owner, { value: controller, configurable: true })
  try { refresh() } catch (error) { disconnect(); throw error }
  return controller
}
