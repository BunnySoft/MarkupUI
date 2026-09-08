import { createFeedbackExpiry, feedbackDuration } from "../feedback/expiry.js"
import type { FeedbackExpiry } from "../feedback/expiry.js"
import { claimFeedbackRoot, observeFeedbackRoot } from "../feedback/lifetime.js"

export type MessageType = "default" | "info" | "success" | "warning" | "error" | "loading"
export interface MessageOptions {
  type?: MessageType
  duration?: number
  closable?: boolean
  keepAliveOnHover?: boolean
  showIcon?: boolean
  onClose?: (() => void) | undefined
}
export interface MessageUpdate extends MessageOptions { content?: string }
export interface MessageOwnerOptions {
  duration?: number
  closable?: boolean
  keepAliveOnHover?: boolean
  max?: number
  template?: HTMLTemplateElement
  focusFallback?: HTMLElement
}
export type MessageRemoveReason = "close" | "destroy" | "expired" | "dispose" | "detached"
export interface MessageError {
  handle: MessageHandle | null
  error: unknown
  phase: "close" | "anatomy"
  stale: boolean
}
export interface MessageHandle {
  readonly element: HTMLLIElement
  readonly closed: boolean
  readonly content: string
  readonly type: MessageType
  readonly duration: number
  readonly remaining: number
  readonly paused: boolean
  readonly lastError: unknown
  update(patch: MessageUpdate): void
  destroy(): void
}
export interface MessageOwner {
  readonly connected: boolean
  readonly messages: readonly MessageHandle[]
  readonly max: number
  create(content: string, options?: MessageOptions): MessageHandle
  info(content: string, options?: MessageOptions): MessageHandle
  success(content: string, options?: MessageOptions): MessageHandle
  warning(content: string, options?: MessageOptions): MessageHandle
  error(content: string, options?: MessageOptions): MessageHandle
  loading(content: string, options?: MessageOptions): MessageHandle
  destroyAll(): void
  dispose(): void
}
interface State {
  content: string
  type: MessageType
  duration: number
  closable: boolean
  keepAliveOnHover: boolean
  showIcon: boolean
  onClose: (() => void) | undefined
}
interface Record {
  handle: MessageHandle
  remove(reason: MessageRemoveReason): void
}
const labels: { [key in MessageType]: string } = { default: "Message", info: "Information", success: "Success", warning: "Warning", error: "Error", loading: "Loading" }
const icons: { [key in MessageType]: string } = { default: "•", info: "i", success: "✓", warning: "!", error: "×", loading: "…" }
const optionKeys = ["type", "duration", "closable", "keepAliveOnHover", "showIcon", "onClose"]
const liveSelector = '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"], output'
function keys(value: object, allowed: string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) {
    throw new TypeError("Unsupported Message options; no renderer, style objects or framework props.")
  }
}
function text(value: string) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError("Message content must be nonempty literal text.")
  return value
}

export function createMessageOwner(root: HTMLElement, options: MessageOwnerOptions = {}): MessageOwner {
  keys(options, ["duration", "closable", "keepAliveOnHover", "max", "template", "focusFallback"])
  const document = root?.ownerDocument
  const view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !["div", "section", "aside"].includes(root.localName)
    || root.getRootNode() !== document || !root.classList.contains("mui-message-host")) {
    throw new TypeError("Use a connected light-DOM native .mui-message-host.")
  }
  const items = root.querySelector<HTMLOListElement>(":scope > ol[data-message-items]")
  const announcer = root.querySelector<HTMLElement>(":scope > [data-message-announcer]")
  function anatomy() {
    if (!items || !announcer || items.parentElement !== root || announcer.parentElement !== root
      || root.querySelector(":scope > ol[data-message-items]") !== items
      || root.querySelector(":scope > [data-message-announcer]") !== announcer
      || root.querySelectorAll(":scope > [data-message-items]").length !== 1
      || root.querySelectorAll(":scope > [data-message-announcer]").length !== 1
      || announcer.getAttribute("role") !== "status" || announcer.getAttribute("aria-atomic") !== "true"
      || ![null, "polite"].includes(announcer.getAttribute("aria-live"))
      || [...root.querySelectorAll(liveSelector)].some(node => node !== announcer)) {
      throw new TypeError("Author a dedicated native ol and one atomic polite status announcer.")
    }
    for (let node: HTMLElement | null = root; node; node = node.parentElement) {
      if (node.matches(liveSelector)) throw new TypeError("Message roots must not be nested in another live region.")
    }
  }
  anatomy()
  if (items!.childElementCount || items!.textContent?.trim() || announcer!.childElementCount || announcer!.textContent?.trim()) {
    throw new TypeError("Dedicated items and announcer must start empty; keep authored baselines outside them.")
  }
  const duration = feedbackDuration(options.duration === undefined ? 3000 : options.duration)
  const max = options.max === undefined ? 5 : options.max
  if (!Number.isInteger(max) || max < 1 || max > 50) throw new RangeError("Message max must be an integer from 1 to 50.")
  for (const value of [options.closable, options.keepAliveOnHover]) if (value !== undefined && typeof value !== "boolean") throw new TypeError("Message policies must be boolean.")
  const template = options.template
  if (template !== undefined && (!(template instanceof view.HTMLTemplateElement) || template.content.children.length !== 1)) throw new TypeError("Use one native li in a trusted template.")
  const fallback = options.focusFallback
  if (fallback !== undefined && (!(fallback instanceof view.HTMLElement) || fallback.ownerDocument !== document || items!.contains(fallback))) {
    throw new TypeError("Focus fallback must be an explicit element outside the message list in the same document.")
  }
  const release = claimFeedbackRoot(root)
  const announcement = document.createElement("span")
  announcer!.append(announcement)
  const records = new Set<Record>()
  let disposed = false
  let clearing = false
  let creating = 0
  let ownerEpoch = 0
  let stopObserving = () => {}
  function emit(name: string, detail: unknown) { root.dispatchEvent(new view!.CustomEvent(name, { detail })) }
  function report(detail: MessageError, visible = false) {
    const event = new view!.CustomEvent("mui:message-error", { detail, cancelable: true })
    if (root.dispatchEvent(event) && !visible) view!.console.error("MarkupUI Message:", detail.error)
  }
  function scan() {
    if (disposed) return
    if (root.getRootNode() !== document) { dispose(true); return }
    try {
      anatomy()
      if (announcement.parentElement !== announcer) throw new TypeError("Message announcer was replaced.")
    } catch (error) {
      dispose(true)
      report({ handle: null, error, phase: "anatomy", stale: false })
      return
    }
    for (const record of [...records]) if (record.handle.element.parentElement !== items) record.remove("detached")
  }
  function available(node: HTMLElement) {
    return node.isConnected && !node.matches(":disabled") && !node.closest("[hidden], [inert]")
  }
  function announce(value: string) { if (!disposed && announcement.parentElement === announcer) announcement.textContent = value }
  function parse(content: string, patch: MessageOptions, previous?: State): State {
    keys(patch, optionKeys)
    if (patch.duration !== undefined) feedbackDuration(patch.duration)
    for (const value of [patch.closable, patch.keepAliveOnHover, patch.showIcon]) {
      if (value !== undefined && typeof value !== "boolean") throw new TypeError("Message flags must be boolean.")
    }
    if (patch.type !== undefined && typeof patch.type !== "string") throw new TypeError("Message type must be text.")
    const type = patch.type ?? previous?.type ?? "default"
    if (!Object.hasOwn(labels, type)) throw new TypeError("Unknown Message type.")
    const state: State = {
      content: text(content), type,
      duration: patch.duration ?? previous?.duration ?? (type === "loading" ? 0 : duration),
      closable: patch.closable ?? previous?.closable ?? options.closable ?? false,
      keepAliveOnHover: patch.keepAliveOnHover ?? previous?.keepAliveOnHover ?? options.keepAliveOnHover ?? false,
      showIcon: patch.showIcon ?? previous?.showIcon ?? true,
      onClose: Object.hasOwn(patch, "onClose") ? patch.onClose : previous?.onClose,
    }
    feedbackDuration(state.duration)
    for (const value of [state.closable, state.keepAliveOnHover, state.showIcon]) if (typeof value !== "boolean") throw new TypeError("Message flags must be boolean.")
    if (state.onClose !== undefined && typeof state.onClose !== "function") throw new TypeError("onClose must be a notification function.")
    return state
  }
  function defaultElement(): HTMLLIElement {
    const item = document.createElement("li")
    item.className = "mui-message"
    const icon = document.createElement("span"); icon.dataset.messageIcon = ""; icon.setAttribute("aria-hidden", "true")
    const kind = document.createElement("strong"); kind.dataset.messageKind = ""
    const content = document.createElement("span"); content.dataset.messageContent = ""
    const close = document.createElement("button"); close.type = "button"; close.dataset.messageClose = ""; close.setAttribute("aria-label", "Dismiss message"); close.textContent = "×"
    const error = document.createElement("p"); error.dataset.messageError = ""; error.hidden = true; error.textContent = "Unable to dismiss this message. Try again."
    item.append(icon, kind, content, close, error)
    return item
  }
  function create(content: string, config: MessageOptions = {}): MessageHandle {
    scan()
    if (disposed || clearing) throw new Error("Message owner is unavailable.")
    const creationEpoch = ownerEpoch
    const initial = parse(content, config)
    if (disposed || ownerEpoch !== creationEpoch) throw new Error("Message creation was interrupted.")
    if (records.size + creating >= max) throw new RangeError("Message capacity reached; no existing item was evicted.")
    creating++
    let reserved = true
    try {
      const element = template ? document.importNode(template.content.firstElementChild!, true) as HTMLLIElement : defaultElement()
      if (!(element instanceof view!.HTMLLIElement) || !element.classList.contains("mui-message")
        || element.hidden || element.hasAttribute("inert") || ![null, "listitem"].includes(element.getAttribute("role"))
        || element.matches(`${liveSelector}, [autofocus], [contenteditable]:not([contenteditable="false"])`)
        || element.querySelector(`${liveSelector}, script, style, iframe, object, embed, dialog, [autofocus], [contenteditable]:not([contenteditable="false"])`)) {
        throw new TypeError("Message templates need a non-live native li, without executable/modal/autofocus/editable content.")
      }
      const ids = [element, ...element.querySelectorAll<HTMLElement>("[id]")].map(node => node.id).filter(Boolean)
      if (new Set(ids).size !== ids.length || ids.some(id => document.getElementById(id))) throw new TypeError("Message template IDs must be unique; use an ID-free template for concurrent messages.")
      function one(selector: string) {
        const nodes = element.querySelectorAll<HTMLElement>(selector)
        if (nodes.length !== 1) throw new TypeError(`Message needs exactly one ${selector}.`)
        return nodes[0]!
      }
      const body = one("[data-message-content]")
      const kind = one("[data-message-kind]")
      const errorRegion = one("[data-message-error]")
      const button = one("[data-message-close]")
      const icon = element.querySelector<HTMLElement>("[data-message-icon]")
      function validate() {
        for (const [selector, node] of [["[data-message-content]", body], ["[data-message-kind]", kind], ["[data-message-error]", errorRegion], ["[data-message-close]", button]] as const) {
          if (one(selector) !== node) throw new TypeError("Message anatomy changed; destroy before replacing marked regions.")
        }
        if ([body, kind, errorRegion].some(node => !["p", "span", "div", "strong", "em", "small"].includes(node.localName) || node.childElementCount)
          || new Set([body, kind, errorRegion, button, icon]).size !== 5
          || [body, kind, errorRegion, button].some(node => [body, kind, errorRegion, button].some(other => node !== other && node.contains(other)))
          || !(button instanceof view!.HTMLButtonElement) || button.type !== "button"
          || !(button.textContent?.trim() || button.getAttribute("aria-label")?.trim())
          || ["command", "commandfor", "popovertarget", "popovertargetaction"].some(name => button.hasAttribute(name))
          || !errorRegion.textContent?.trim()
          || element.querySelectorAll("[data-message-icon]").length > 1 || element.querySelector("[data-message-icon]") !== icon
          || icon && (icon.getAttribute("aria-hidden") !== "true" || icon.matches("button, a, input, select, textarea, [tabindex], [contenteditable]")
            || icon.querySelector("button, a, input, select, textarea, [tabindex], [contenteditable]"))
          || element.matches(liveSelector) || element.querySelector(liveSelector)) throw new TypeError("Keep Message text regions, a named type=button close control, non-live error text and decorative-only icon.")
      }
      validate()
      if (!errorRegion.hidden) throw new TypeError("Message error text must start hidden.")
      let state = initial
      let closed = false
      let version = 0
      let queued: number | null = null
      let lastError: unknown = null
      let clock: FeedbackExpiry
      function paint(patch: MessageUpdate, all = false) {
        if (all || patch.content !== undefined) body.textContent = state.content
        if (all || patch.type !== undefined) {
          element.dataset.messageType = state.type
          kind.textContent = labels[state.type]
          if (!template && icon) icon.textContent = icons[state.type]
        }
        if (all || patch.closable !== undefined) button.hidden = !state.closable
        if (icon && (all || patch.showIcon !== undefined)) icon.hidden = !state.showIcon
        errorRegion.hidden = true
      }
      function active() { return !closed && !disposed && element.parentElement === items && root.getRootNode() === document }
      function remove(reason: MessageRemoveReason) {
        if (closed) return
        const focused = element.contains(document.activeElement)
        closed = true
        version++
        clock.dispose()
        if (queued !== null) view!.clearTimeout(queued)
        element.removeEventListener("click", click)
        records.delete(record)
        if (element.parentElement === items) element.remove()
        if (focused && reason !== "expired" && reason !== "detached" && fallback && available(fallback)
          && document.activeElement === document.body) fallback.focus({ preventScroll: true })
        emit("mui:message-remove", { handle, reason })
      }
      function failure(error: unknown, token: number) {
        lastError = error
        const stale = !active() || version !== token || !errorRegion.isConnected || !element.contains(errorRegion)
        if (!stale) {
          clock.restart(0, state.keepAliveOnHover)
          errorRegion.hidden = false
          announce(`${errorRegion.textContent} ${state.content}`)
        }
        report({ handle, error, phase: "close", stale }, !stale)
      }
      function click(event: MouseEvent) {
        if (!button.contains(event.target as Node) || queued !== null || !state.closable || !available(button)) return
        const token = version
        queued = view!.setTimeout(() => {
          queued = null
          if (event.defaultPrevented || !active() || token !== version) return
          let result: unknown
          try { validate(); result = state.onClose?.() }
          catch (error) { failure(error, token); return }
          // onClose is a notification, not an asynchronous veto. Observe any late rejection.
          void Promise.resolve(result).catch(error => failure(error, token))
          if (active() && version === token) remove("close")
        }, 0)
      }
      const handle: MessageHandle = {
        element,
        get closed() { scan(); return closed },
        get content() { return state.content },
        get type() { return state.type },
        get duration() { return state.duration },
        get remaining() { return clock.remaining },
        get paused() { return clock.paused },
        get lastError() { return lastError },
        update(patch) {
          scan()
          if (!active() || clearing) throw new Error("Message handle is closed, detached or being cleared.")
          keys(patch, [...optionKeys, "content"])
          const { content = state.content, ...rest } = patch
          const next = parse(content, rest, state)
          validate()
          if (patch.closable === false && button.contains(document.activeElement)) throw new Error("Move focus before hiding the focused close control.")
          version++
          state = next
          lastError = null
          paint(patch)
          clock.restart(state.duration, state.keepAliveOnHover)
          announce(`${labels[state.type]}: ${state.content}`)
          emit("mui:message-update", { handle })
        },
        destroy: () => remove("destroy"),
      }
      const record: Record = { handle, remove }
      if (disposed || ownerEpoch !== creationEpoch) throw new Error("Message creation was interrupted.")
      clock = createFeedbackExpiry(element, () => { if (active()) remove("expired"); else remove("detached") })
      element.addEventListener("click", click)
      paint({}, true)
      creating--
      reserved = false
      records.add(record)
      try {
        items!.append(element)
        if (!active() || clearing || ownerEpoch !== creationEpoch) throw new Error("Message creation was interrupted.")
        clock.restart(state.duration, state.keepAliveOnHover)
        announce(`${labels[state.type]}: ${state.content}`)
        emit("mui:message-create", { handle })
        return handle
      } catch (error) { remove("detached"); throw error }
    } finally { if (reserved) creating-- }
  }
  const typed = (type: MessageType) => (content: string, config: MessageOptions = {}) => {
    keys(config, optionKeys)
    return create(content, { ...config, type })
  }
  function dispose(automatic = false) {
    if (disposed) return
    disposed = true
    ownerEpoch++
    stopObserving()
    for (const record of [...records]) record.remove(automatic ? "detached" : "dispose")
    if (announcement.parentElement === announcer) announcement.remove()
    release()
  }
  const owner: MessageOwner = {
    get connected() { scan(); return !disposed },
    get messages() { scan(); return [...records].map(record => record.handle) },
    max,
    create,
    info: typed("info"), success: typed("success"), warning: typed("warning"),
    error: typed("error"), loading: typed("loading"),
    destroyAll() {
      if (clearing || disposed) return
      clearing = true
      ownerEpoch++
      try { for (const record of [...records]) record.remove("destroy") }
      finally { clearing = false }
    },
    dispose: () => dispose(),
  }
  stopObserving = observeFeedbackRoot(root, scan)
  return owner
}
