import { ownedWrites } from "../popover/position.js"
import { createScrollContext, fragmentId } from "../anchor/scroll.js"
import type { NativeScrollBehavior, NativeScrollRoot } from "../anchor/scroll.js"

export interface BackTopOptions {
  root?: NativeScrollRoot
  visibilityHeight?: number
  show?: boolean | null
  behavior?: NativeScrollBehavior
}
export interface BackTopController {
  readonly connected: boolean
  readonly thresholdVisible: boolean
  /** Helper visibility, including focus retention; author hidden/CSS still takes precedence. */
  readonly visible: boolean
  show: boolean | null
  update(): void
  refresh(): void
  scrollToTop(options?: { behavior?: NativeScrollBehavior }): boolean
  connect(): void
  disconnect(): void
}
const owners = new WeakMap<HTMLElement, BackTopController>()

export function createBackTop(action: HTMLButtonElement | HTMLAnchorElement, options: BackTopOptions = {}): BackTopController {
  const document = action?.ownerDocument
  const view = document?.defaultView
  if (!view || !(action instanceof view.HTMLButtonElement || action instanceof view.HTMLAnchorElement)
    || !action.classList.contains("mui-back-top")) throw new TypeError("Back Top requires an authored button or fragment link with class mui-back-top.")
  if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Back Top options must be an object.")
  for (const key of Object.keys(options)) if (!["root", "visibilityHeight", "show", "behavior"].includes(key)) throw new TypeError(`Unsupported Back Top option: ${key}.`)
  const height = options.visibilityHeight === undefined ? 180 : options.visibilityHeight
  if (!Number.isFinite(height) || height < 0) throw new RangeError("visibilityHeight must be finite and nonnegative.")
  const behavior = options.behavior === undefined ? "smooth" : options.behavior
  function checkBehavior(value: unknown) {
    if (!["auto", "instant", "smooth"].includes(value as string)) throw new TypeError("Invalid native scroll behavior.")
  }
  function checkShow(value: unknown) {
    if (value !== null && typeof value !== "boolean") throw new TypeError("show must be boolean or null for automatic visibility.")
  }
  checkBehavior(behavior)
  let show = options.show ?? null
  checkShow(show)
  const context = createScrollContext(document!, options.root)
  const writes = ownedWrites()
  const button = action instanceof view.HTMLButtonElement
  let connected = false, visible = true
  let threshold: boolean | null = null
  let frame = 0, generation = 0
  let resize: ResizeObserver | undefined
  const tasks = new Set<number>()
  const removers: (() => void)[] = []
  function validate() {
    if (action.ownerDocument !== document || action.getRootNode() !== document
      || !action.classList.contains("mui-back-top") || action.hasAttribute("role")
      || action.parentElement?.closest("a[href], button, summary, label")
      || action.hasAttribute("tabindex") || action.querySelector("a, button, input, select, textarea, summary, [tabindex], [contenteditable], [role]")) {
      throw new TypeError("Keep Back Top a connected native action without nested controls, custom roles or tabindex.")
    }
    const labels = action.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean)
    if (!(labels?.length ? labels.every(id => document!.getElementById(id)?.textContent?.trim())
      : action.getAttribute("aria-label")?.trim() || [...action.childNodes].some(node =>
        node.nodeType === 3 ? node.textContent?.trim() : node instanceof view!.HTMLElement
          && node.getAttribute("aria-hidden") !== "true" && !node.hidden && node.localName !== "template" && node.textContent?.trim()))) {
      throw new TypeError("Author accessible text or a label for Back Top; decorative icons are not a name.")
    }
    if (button) {
      if (action.getAttribute("type")?.toLowerCase() !== "button" || action.hasAttribute("popovertarget")
        || action.hasAttribute("commandfor")) throw new TypeError("Back Top buttons need explicit type=button and no other native command.")
    } else {
      const href = action.getAttribute("href")
      const url = new view!.URL(href ?? "", document!.baseURI), current = new view!.URL(document!.URL)
      if (!href || url.origin !== current.origin || url.pathname !== current.pathname || url.search !== current.search
        || url.hash.length < 2 || !document!.getElementById(fragmentId(url.hash))) {
        throw new TypeError("Back Top links need a same-document fragment with an authored destination.")
      }
    }
  }
  function fail(error: unknown) {
    controller.disconnect()
    action.dispatchEvent(new view!.CustomEvent("mui:back-top-error", { detail: { error } }))
  }
  function schedule() {
    if (connected && !frame) frame = view!.requestAnimationFrame(() => {
      frame = 0
      try { controller.update() } catch (error) { fail(error) }
    })
  }
  function listen(target: EventTarget, type: string, handler: EventListener = schedule) {
    target.addEventListener(type, handler, { passive: true })
    removers.push(() => target.removeEventListener(type, handler))
  }
  function available() {
    return !action.closest("[hidden], [inert]") && !action.matches(":disabled")
      && action.getAttribute("aria-disabled") !== "true" && !action.hasAttribute("data-back-top-hidden")
  }
  function paint() {
    visible = (show ?? threshold ?? false) || document!.activeElement === action
    writes.attr(action, "data-back-top-hidden", visible ? null : "")
  }
  function click(event: Event) {
    const mouse = event as MouseEvent
    if (mouse.button !== 0 || mouse.ctrlKey || mouse.metaKey || mouse.altKey || mouse.shiftKey
      || event.defaultPrevented || !available()) return
    const version = generation
    // A later task sees cancellation from every synchronous native event listener.
    const task = view!.setTimeout(() => {
      tasks.delete(task)
      if (!connected || version !== generation || event.defaultPrevented || !available()) return
      try { controller.scrollToTop() } catch (error) { fail(error) }
    }, 0)
    tasks.add(task)
  }
  const controller: BackTopController = {
    get connected() { return connected },
    get thresholdVisible() { return threshold ?? false },
    get visible() { return visible },
    get show() { return show },
    set show(value) {
      checkShow(value)
      show = value
      if (connected) {
        if (!action.isConnected || !context.connected) { controller.disconnect(); return }
        try { validate(); paint() } catch (error) { controller.disconnect(); throw error }
      }
    },
    update() {
      if (!connected) return
      if (!action.isConnected || !context.connected) { controller.disconnect(); return }
      try { validate() } catch (error) { controller.disconnect(); throw error }
      let next: boolean
      try { next = context.metrics().scrollTop >= height } catch (error) { controller.disconnect(); throw error }
      const changed = threshold !== null && threshold !== next
      threshold = next
      paint()
      if (changed) action.dispatchEvent(new view!.CustomEvent("mui:back-top-update-show", { detail: { show: next } }))
    },
    refresh() {
      if (!connected) throw new Error("Connect Back Top before refreshing.")
      generation++
      for (const task of tasks) view!.clearTimeout(task)
      tasks.clear()
      controller.update()
    },
    scrollToTop(scrollOptions = {}) {
      if (!scrollOptions || typeof scrollOptions !== "object" || Array.isArray(scrollOptions)) throw new TypeError("Scroll options must be an object.")
      for (const key of Object.keys(scrollOptions)) if (key !== "behavior") throw new TypeError(`Unsupported scroll option: ${key}.`)
      if (scrollOptions.behavior !== undefined) checkBehavior(scrollOptions.behavior)
      if (!connected) return false
      if (!action.isConnected || !context.connected) { controller.disconnect(); return false }
      try {
        validate()
        const moved = context.scrollTo(0, scrollOptions.behavior ?? behavior)
        schedule()
        return moved
      } catch (error) { controller.disconnect(); throw error }
    },
    connect() {
      if (connected) return
      validate()
      if (owners.has(action)) throw new Error("Back Top action already has an active controller.")
      context.metrics()
      owners.set(action, controller)
      connected = true
      generation++
      threshold = null
      try {
        listen(context.target, "scroll")
        listen(view!, "resize")
        listen(action, "focus")
        listen(action, "blur")
        if (button) listen(action, "click", click)
        if (view!.visualViewport) { listen(view!.visualViewport, "resize"); listen(view!.visualViewport, "scroll") }
        if (view!.ResizeObserver) { resize = new view!.ResizeObserver(schedule); resize.observe(context.element) }
        controller.update()
      } catch (error) { controller.disconnect(); throw error }
    },
    disconnect() {
      connected = false
      generation++
      view!.cancelAnimationFrame(frame)
      frame = 0
      for (const task of tasks) view!.clearTimeout(task)
      tasks.clear()
      resize?.disconnect()
      resize = undefined
      for (const remove of removers.splice(0)) remove()
      writes.restore()
      visible = !action.hasAttribute("data-back-top-hidden")
      threshold = null
      if (owners.get(action) === controller) owners.delete(action)
    },
  }
  controller.connect()
  return controller
}
