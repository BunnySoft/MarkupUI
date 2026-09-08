import { createFeedbackExpiry, feedbackDuration } from "../feedback/expiry.js"
import { createFeedbackAttributes } from "../feedback/attributes.js"
import { claimFeedbackRoot, observeFeedbackRoot } from "../feedback/lifetime.js"

export type NotificationType = "default" | "info" | "success" | "warning" | "error"
export type NotificationAnnouncement = "polite" | "assertive" | "off"
export interface NotificationOptions {
  title?: string
  description?: string
  content?: string
  meta?: string
  action?: string
  type?: NotificationType
  duration?: number
  closable?: boolean
  keepAliveOnHover?: boolean
  onClose?: (() => unknown | Promise<unknown>) | undefined
}
export interface NotificationOwnerOptions {
  max?: number
  keepAliveOnHover?: boolean
  template?: HTMLTemplateElement
  focusFallback?: HTMLElement
}
export interface NotificationHandle {
  readonly element: HTMLElement
  readonly closed: boolean
  readonly pending: boolean
  readonly lastClose: Promise<boolean> | null
  readonly lastError: unknown
  readonly title: string
  readonly content: string
  readonly type: NotificationType
  readonly duration: number
  readonly remaining: number
  readonly paused: boolean
  update(patch: NotificationOptions): void
  requestClose(): Promise<boolean>
  destroy(): void
}
export interface NotificationOwner {
  readonly connected: boolean
  readonly announcement: NotificationAnnouncement
  readonly notifications: readonly NotificationHandle[]
  readonly max: number
  create(options: NotificationOptions): NotificationHandle
  info(options: NotificationOptions): NotificationHandle
  success(options: NotificationOptions): NotificationHandle
  warning(options: NotificationOptions): NotificationHandle
  error(options: NotificationOptions): NotificationHandle
  destroyAll(): void
  dispose(): void
}
export type NotificationRemoveReason = "close" | "destroy" | "expired" | "dispose" | "detached"
export interface NotificationError {
  handle: NotificationHandle | null
  error: unknown
  phase: "close" | "anatomy"
  stale: boolean
}
const fields = ["title", "description", "content", "meta", "action"] as const
type TextField = typeof fields[number]
interface State extends Record<TextField, string> {
  type: NotificationType
  duration: number
  closable: boolean
  keepAliveOnHover: boolean
  onClose: (() => unknown | Promise<unknown>) | undefined
}
const labels: Record<NotificationType, string> = { default: "Notification", info: "Information", success: "Success", warning: "Warning", error: "Error" }
const glyphs: Record<NotificationType, string> = { default: "•", info: "i", success: "✓", warning: "!", error: "×" }
const live = '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"], output'
const optionKeys = [...fields, "type", "duration", "closable", "keepAliveOnHover", "onClose"]
function keys(value: object, allowed: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) {
    throw new TypeError("Unsupported Notification options; use native templates, not render/avatar/style functions.")
  }
}

export function createNotificationOwner(root: HTMLElement, options: NotificationOwnerOptions = {}): NotificationOwner {
  keys(options, ["max", "keepAliveOnHover", "template", "focusFallback"])
  const document = root?.ownerDocument
  const view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !["div", "section", "aside"].includes(root.localName)
    || root.getRootNode() !== document || !root.classList.contains("mui-notification-host") || root.closest("a, button")) {
    throw new TypeError("Use a connected light-DOM native .mui-notification-host.")
  }
  const items = root.querySelector<HTMLElement>(":scope > [data-notification-items]")
  const announcer = root.querySelector<HTMLElement>(":scope > [data-notification-announcer]")
  function readPolicy(): NotificationAnnouncement {
    const role = announcer?.getAttribute("role")
    const aria = announcer?.getAttribute("aria-live")
    if (!["status", "alert"].includes(role ?? "") || announcer?.getAttribute("aria-atomic") !== "true"
      || ![null, "off", role === "alert" ? "assertive" : "polite"].includes(aria ?? null)) {
      throw new TypeError("Author one atomic status/alert announcer, optionally aria-live=off.")
    }
    return aria === "off" ? "off" : role === "alert" ? "assertive" : "polite"
  }
  const policy = readPolicy()
  function anatomy() {
    if (!items || !announcer || items.localName !== "div" || items.parentElement !== root || announcer.parentElement !== root
      || root.querySelector(":scope > [data-notification-items]") !== items
      || root.querySelector(":scope > [data-notification-announcer]") !== announcer
      || root.querySelectorAll(":scope > [data-notification-items]").length !== 1
      || root.querySelectorAll(":scope > [data-notification-announcer]").length !== 1
      || readPolicy() !== policy || [...root.querySelectorAll(live)].some(node => node !== announcer)) {
      throw new TypeError("Keep dedicated notification items and a single stable announcement policy.")
    }
    for (let node: HTMLElement | null = root; node; node = node.parentElement) {
      if (node.matches(live)) throw new TypeError("Do not nest Notification inside another live region.")
    }
  }
  anatomy()
  if (items!.childElementCount || items!.textContent?.trim() || announcer!.childElementCount || announcer!.textContent?.trim()) {
    throw new TypeError("Dedicated Notification regions must start empty.")
  }
  const max = options.max === undefined ? 5 : options.max
  if (!Number.isInteger(max) || max < 1 || max > 50) throw new RangeError("Notification max must be an integer from 1 to 50.")
  if (options.keepAliveOnHover !== undefined && typeof options.keepAliveOnHover !== "boolean") throw new TypeError("Hover policy must be boolean.")
  const template = options.template
  if (template !== undefined && (!(template instanceof view.HTMLTemplateElement) || template.content.children.length !== 1)) {
    throw new TypeError("Use one native article in a trusted template.")
  }
  const fallback = options.focusFallback
  if (fallback !== undefined && (!(fallback instanceof view.HTMLElement) || fallback.ownerDocument !== document || items!.contains(fallback))) {
    throw new TypeError("Focus fallback must be an explicit same-document element outside the collection.")
  }
  const release = claimFeedbackRoot(root)
  const announcement = document.createElement("span")
  announcer!.append(announcement)
  const records = new Set<{ handle: NotificationHandle; remove(reason: NotificationRemoveReason, focusHint?: boolean): void }>()
  let disposed = false
  let clearing = false
  let creating = 0
  let ownerEpoch = 0
  let stopObserving = () => {}
  function emit(name: string, detail: unknown) { root.dispatchEvent(new view!.CustomEvent(name, { detail })) }
  function announce(text: string) {
    if (!disposed && policy !== "off" && announcement.parentElement === announcer) announcement.textContent = text
  }
  function report(detail: NotificationError, visible = false) {
    if (root.dispatchEvent(new view!.CustomEvent("mui:notification-error", { detail, cancelable: true })) && !visible) {
      view!.console.error("MarkupUI Notification:", detail.error)
    }
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
  function scan() {
    if (disposed) return
    if (root.getRootNode() !== document) { dispose(true); return }
    try {
      anatomy()
      if (announcement.parentElement !== announcer) throw new TypeError("Notification announcer was replaced.")
    } catch (error) {
      dispose(true)
      report({ handle: null, error, phase: "anatomy", stale: false })
      return
    }
    for (const record of [...records]) if (record.handle.element.parentElement !== items) record.remove("detached")
  }
  function available(node: HTMLElement) { return node.isConnected && !node.matches(":disabled") && !node.closest("[hidden], [inert]") }
  function defaults(): HTMLElement {
    const article = document.createElement("article"); article.className = "mui-notification"
    const icon = document.createElement("span"); icon.dataset.notificationIcon = ""; icon.setAttribute("aria-hidden", "true")
    const header = document.createElement("header"); header.dataset.notificationHeader = ""
    const kind = document.createElement("strong"); kind.dataset.notificationKind = ""
    const title = document.createElement("p"); title.dataset.notificationTitle = ""; header.append(kind, title)
    const close = document.createElement("button"); close.type = "button"; close.dataset.notificationClose = ""; close.setAttribute("aria-label", "Dismiss notification"); close.textContent = "×"
    article.append(icon, header, close)
    for (const field of ["description", "content", "meta", "action"] as const) {
      const node = document.createElement("p")
      node.setAttribute(field === "action" ? "data-notification-action-text" : `data-notification-${field}`, "")
      article.append(node)
    }
    for (const [name, value] of [["pending", "Waiting for close approval…"], ["error", "Unable to close this notification. Try again."]] as const) {
      const node = document.createElement("p"); node.setAttribute(`data-notification-${name}`, ""); node.hidden = true; node.textContent = value; article.append(node)
    }
    return article
  }
  function create(config: NotificationOptions): NotificationHandle {
    scan()
    if (disposed || clearing) throw new Error("Notification owner is unavailable.")
    const creationEpoch = ownerEpoch
    keys(config, optionKeys)
    if (records.size + creating >= max) throw new RangeError("Notification capacity reached; no existing card was evicted.")
    creating++
    let reserved = true
    try {
      const element = template ? document.importNode(template.content.firstElementChild!, true) as HTMLElement : defaults()
      if (!(element instanceof view!.HTMLElement) || element.localName !== "article" || !element.classList.contains("mui-notification")
        || element.hidden || element.hasAttribute("inert") || ![null, "article"].includes(element.getAttribute("role"))
        || element.matches(`${live}, [autofocus], [aria-modal], [contenteditable]:not([contenteditable="false"])`)
        || element.querySelector(`${live}, script, style, iframe, object, embed, dialog, [role="dialog"], [role="alertdialog"], [aria-modal], [autofocus], [contenteditable]:not([contenteditable="false"])`)) {
        throw new TypeError("Author a nonmodal, non-live article without executable, autofocus or editable content.")
      }
      const ids = [element, ...element.querySelectorAll<HTMLElement>("[id]")].map(node => node.id).filter(Boolean)
      if (new Set(ids).size !== ids.length || ids.some(id => document.getElementById(id))) throw new TypeError("Notification template IDs must be unique.")
      if (element.hasAttribute("onclick") || root.closest("form") && element.querySelector("form")
        || [...element.querySelectorAll("button,input,select,textarea,form")].some(node => node.parentElement?.closest("a,button"))) {
        throw new TypeError("Keep native actions separate; do not wrap controls in a card-wide link/button or nest forms.")
      }
      function one(selector: string) {
        const nodes = element.querySelectorAll<HTMLElement>(selector)
        if (nodes.length !== 1) throw new TypeError(`Notification needs exactly one ${selector}.`)
        return nodes[0]!
      }
      const regions = Object.fromEntries(fields.map(field => [field, one(field === "action" ? "[data-notification-action-text]" : `[data-notification-${field}]`)])) as Record<TextField, HTMLElement>
      const kind = one("[data-notification-kind]")
      const button = one("[data-notification-close]")
      const pendingRegion = one("[data-notification-pending]")
      const errorRegion = one("[data-notification-error]")
      const icon = element.querySelector<HTMLElement>("[data-notification-icon]")
      const avatar = element.querySelector<HTMLElement>("[data-notification-avatar]")
      function parse(patch: NotificationOptions, previous?: State): State {
        keys(patch, optionKeys)
        const state = { ...previous } as State
        for (const field of fields) {
          const value = patch[field] === undefined ? previous?.[field] ?? regions[field].textContent ?? "" : patch[field]
          if (typeof value !== "string") throw new TypeError("Notification text options are strings, never render functions.")
          state[field] = value
        }
        if (![state.title, state.description, state.content].some(text => text.trim())) throw new TypeError("Supply readable title, description or content.")
        state.type = patch.type === undefined ? previous?.type ?? "default" : patch.type
        if (typeof state.type !== "string" || !Object.hasOwn(labels, state.type)) throw new TypeError("Unknown Notification type.")
        state.duration = patch.duration === undefined ? previous?.duration ?? 0 : patch.duration
        feedbackDuration(state.duration)
        state.closable = patch.closable === undefined ? previous?.closable ?? true : patch.closable
        state.keepAliveOnHover = patch.keepAliveOnHover === undefined ? previous?.keepAliveOnHover ?? options.keepAliveOnHover ?? false : patch.keepAliveOnHover
        if (typeof state.closable !== "boolean" || typeof state.keepAliveOnHover !== "boolean") throw new TypeError("Notification flags must be boolean.")
        state.onClose = Object.hasOwn(patch, "onClose") ? patch.onClose : previous?.onClose
        if (state.onClose !== undefined && typeof state.onClose !== "function") throw new TypeError("onClose must be a function.")
        return state
      }
      function named(state: State) {
        if (!template) return
        const refs = element.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean)
        const valid = refs?.length ? refs.every(id => {
          const node = [element, ...element.querySelectorAll<HTMLElement>("[id]")].find(node => node.id === id) ?? document.getElementById(id)
          const field = fields.find(field => regions[field] === node)
          return !!(field ? state[field].trim() : node?.textContent?.trim())
        }) : !!element.getAttribute("aria-label")?.trim()
        if (!valid) throw new TypeError("Name the authored article; do not clear its referenced heading without another valid name.")
      }
      function validate() {
        for (const field of fields) if (one(field === "action" ? "[data-notification-action-text]" : `[data-notification-${field}]`) !== regions[field]) throw new TypeError("Notification text anatomy changed.")
        for (const [name, node] of [["kind", kind], ["close", button], ["pending", pendingRegion], ["error", errorRegion]] as const) {
          if (one(`[data-notification-${name}]`) !== node) throw new TypeError("Notification control/status anatomy changed.")
        }
        const textNodes = [...Object.values(regions), kind, pendingRegion, errorRegion]
        if (new Set([...textNodes, button]).size !== textNodes.length + 1
          || textNodes.some(node => !["p", "span", "div", "strong", "em", "small", "h1", "h2", "h3", "h4", "h5", "h6", "time"].includes(node.localName) || node.childElementCount)
          || textNodes.some(node => node.contains(button) || button.contains(node))
          || !(button instanceof view!.HTMLButtonElement) || button.type !== "button"
          || !(button.textContent?.trim() || button.getAttribute("aria-label")?.trim())
          || ["command", "commandfor", "popovertarget", "popovertargetaction"].some(name => button.hasAttribute(name))
          || !pendingRegion.textContent?.trim() || !errorRegion.textContent?.trim()
          || icon && (icon.getAttribute("aria-hidden") !== "true" || icon.matches("button,a,input,[tabindex]") || icon.querySelector("button,a,input,select,textarea,[tabindex]"))
          || element.matches(live) || element.querySelector(live)) throw new TypeError("Preserve named native controls, plain text regions and non-live pending/error text.")
      }
      let state = parse(config)
      validate(); named(state)
      if (!pendingRegion.hidden || !errorRegion.hidden) throw new TypeError("Author initially hidden pending and error text.")
      let closed = false
      let version = 0
      let pending: { token: number; focused: boolean } | null = null
      let queued: number | null = null
      let lastClose: Promise<boolean> | null = null
      let lastError: unknown = null
      const attributes = createFeedbackAttributes(document)
      const clock = createFeedbackExpiry(element, () => { if (active()) remove("expired"); else remove("detached") })
      function active() { return !closed && !disposed && element.parentElement === items && root.getRootNode() === document }
      function summary() { return `${labels[state.type]}: ${[state.title, state.description, state.content, state.meta, state.action].filter(Boolean).join(". ")}` }
      function paint(patch: NotificationOptions, all = false, current = () => true) {
        for (const field of fields) if (all || patch[field] !== undefined) {
          if (!current()) return false
          regions[field].textContent = state[field]
          if (!current()) return false
          regions[field].hidden = !state[field].trim()
        }
        if (!current()) return false
        if (all || patch.type !== undefined) {
          element.dataset.notificationType = state.type
          if (!current()) return false
          kind.textContent = labels[state.type]
          if (!current()) return false
          if (!template && icon) icon.textContent = glyphs[state.type]
        }
        if (!current()) return false
        if (!template && (all || patch.title !== undefined || patch.type !== undefined)) element.setAttribute("aria-label", state.title.trim() || (state.type === "default" ? "Notification" : `${labels[state.type]} notification`))
        if (!current()) return false
        if (all || patch.closable !== undefined) button.hidden = !state.closable
        if (!current()) return false
        if (icon && !template) icon.hidden = !!avatar
        if (!current()) return false
        errorRegion.hidden = true
        return current()
      }
      function invalidate() {
        const token = ++version
        pending = null
        if (queued !== null) view!.clearTimeout(queued)
        queued = null
        attributes.restore()
        return token
      }
      function remove(reason: NotificationRemoveReason, focusHint = false) {
        if (closed) return
        const focused = element.contains(document.activeElement) || focusHint
        closed = true
        invalidate()
        clock.dispose()
        element.removeEventListener("click", click)
        records.delete(record)
        if (element.parentElement === items) element.remove()
        if (focused && reason !== "expired" && reason !== "detached" && fallback && available(fallback)
          && !items!.contains(fallback) && document.activeElement === document.body) fallback.focus({ preventScroll: true })
        emit("mui:notification-remove", { handle, reason })
      }
      function requestClose(): Promise<boolean> {
        scan()
        if (!active() || clearing) return Promise.resolve(false)
        if (pending && lastClose) return lastClose
        validate(); named(state)
        if (queued !== null) view!.clearTimeout(queued)
        queued = null
        const operation = { token: ++version, focused: element.contains(document.activeElement) }
        pending = operation
        lastError = null
        const callback = state.onClose
        const current = () => active() && version === operation.token
        function finish() {
          pending = null
          attributes.restore()
        }
        function recoverFocus() {
          if (current() && operation.focused && document.activeElement === document.body && available(button)) button.focus({ preventScroll: true })
        }
        const promise: Promise<boolean> = Promise.resolve().then(() => {
          if (!current()) return false
          const result = callback?.()
          if (result === promise) throw new TypeError("A close callback cannot return its own close request.")
          return result
        }).then(result => {
          if (!current()) return false
          finish()
          if (!current()) return false
          if (result !== false) { remove("close", operation.focused); return true }
          recoverFocus()
          if (current()) announce(`Notification kept open. ${summary()}`)
          return false
        }, error => {
          if (current() || closed) lastError = error
          if (current()) { finish(); recoverFocus() }
          const stale = !current() || !errorRegion.isConnected || !element.contains(errorRegion)
          if (!stale) { errorRegion.hidden = false; announce(`${errorRegion.textContent} ${summary()}`) }
          report({ handle, error, phase: "close", stale }, !stale)
          throw error
        })
        lastClose = promise
        void promise.catch(() => {})
        clock.restart(0, state.keepAliveOnHover)
        errorRegion.hidden = true
        for (const [node, name, value] of [[element, "aria-busy", "true"], [button, "disabled", ""], [pendingRegion, "hidden", null]] as const) {
          if (!current()) break
          if (node === button && button.matches(":disabled")) continue
          attributes.set(node, name, value)
        }
        if (current()) announce(`${pendingRegion.textContent} ${summary()}`)
        return promise
      }
      function click(event: MouseEvent) {
        if (!button.contains(event.target as Node) || queued !== null || pending || !state.closable || !available(button)) return
        const token = version
        queued = view!.setTimeout(() => {
          queued = null
          if (event.defaultPrevented || !active() || version !== token) return
          try { void requestClose() } catch (error) { report({ handle, error, phase: "anatomy", stale: false }) }
        }, 0)
      }
      const handle: NotificationHandle = {
        element,
        get closed() { scan(); return closed },
        get pending() { scan(); return !!pending },
        get lastClose() { return lastClose },
        get lastError() { return lastError },
        get title() { return state.title },
        get content() { return state.content },
        get type() { return state.type },
        get duration() { return state.duration },
        get remaining() { return clock.remaining },
        get paused() { return clock.paused },
        requestClose,
        update(patch) {
          scan()
          if (!active() || clearing) throw new Error("Notification is closed, detached or being cleared.")
          const next = parse(patch, state)
          validate(); named(next)
          const activeElement = document.activeElement
          if (patch.closable === false && (button.contains(activeElement) || pending?.focused && activeElement === document.body)
            || fields.some(field => patch[field] !== undefined && !next[field].trim() && regions[field].contains(activeElement))) {
            throw new Error("Move focus before hiding its notification region/control.")
          }
          const focusHint = pending?.focused ?? false
          const token = invalidate()
          if (!active() || token !== version) throw new Error("Notification update was interrupted.")
          state = next
          lastError = null
          if (!paint(patch, false, () => active() && token === version)) throw new Error("Notification update was interrupted.")
          clock.restart(state.duration, state.keepAliveOnHover)
          announce(summary())
          if (focusHint && document.activeElement === document.body && available(button)) button.focus({ preventScroll: true })
          if (active() && token === version) emit("mui:notification-update", { handle })
        },
        destroy: () => remove("destroy"),
      }
      const record = { handle, remove }
      if (disposed || ownerEpoch !== creationEpoch) { clock.dispose(); throw new Error("Notification creation was interrupted.") }
      if (!paint({}, true, () => !disposed && ownerEpoch === creationEpoch)) {
        clock.dispose()
        throw new Error("Notification creation was interrupted.")
      }
      element.addEventListener("click", click)
      creating--; reserved = false
      records.add(record)
      try {
        items!.append(element)
        if (!active() || clearing || ownerEpoch !== creationEpoch) throw new Error("Notification creation was interrupted.")
        clock.restart(state.duration, state.keepAliveOnHover)
        announce(summary())
        emit("mui:notification-create", { handle })
        return handle
      } catch (error) { remove("detached"); throw error }
    } finally { if (reserved) creating-- }
  }
  const typed = (type: NotificationType) => (config: NotificationOptions) => { keys(config, optionKeys); return create({ ...config, type }) }
  const owner: NotificationOwner = {
    get connected() { scan(); return !disposed },
    get notifications() { scan(); return [...records].map(record => record.handle) },
    announcement: policy,
    max,
    create,
    info: typed("info"), success: typed("success"), warning: typed("warning"), error: typed("error"),
    destroyAll() {
      if (clearing || disposed) return
      clearing = true; ownerEpoch++
      try { for (const record of [...records]) record.remove("destroy") }
      finally { clearing = false }
    },
    dispose: () => dispose(),
  }
  stopObserving = observeFeedbackRoot(root, scan)
  return owner
}
