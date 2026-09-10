import { ownedWrites } from "../popover/position.js"

export interface MarqueeSettings {
  active?: boolean
  speed?: number
  direction?: "left" | "right"
  iterations?: number | "infinite"
  delay?: number
  playLabel?: string
  pauseLabel?: string
}
export type MarqueeOptions = MarqueeSettings
export interface MarqueeState {
  readonly active: boolean
  readonly phase: "static" | "running" | "finished" | "error" | "disconnected"
  readonly pauseReasons: readonly string[]
  readonly supported: boolean
  readonly generation: number
  readonly viewportWidth: number
  readonly contentWidth: number
  readonly distance: number
  readonly duration: number
  readonly direction: "left" | "right"
  readonly iterations: number | "infinite"
  readonly error: unknown
}
export interface MarqueeController {
  readonly element: HTMLElement
  readonly viewport: HTMLElement
  readonly content: HTMLElement
  readonly connected: boolean
  readonly state: MarqueeState
  set(settings: MarqueeSettings): void
  play(): void
  pause(): void
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.marquee.owner")
type Owned = HTMLElement & { [owner]?: object }
const liveRegion = '[aria-live]:not([aria-live="off" i]),[role~="alert" i],[role~="status" i],[role~="log" i]'
const contentTags = new Set(["span", "strong", "em", "b", "i", "u", "s", "small", "sub", "sup", "mark", "abbr", "code", "kbd", "samp", "var", "time", "data", "img", "br", "wbr", "ruby", "rt", "rp"])

/** One original horizontal track. Every stop cancels its transform and exposes native scrolling. */
export function createMarquee(element: HTMLElement, options: MarqueeOptions = {}): MarqueeController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !["div", "section"].includes(element.localName)
    || !element.matches(".mui-marquee[data-marquee]") || !element.isConnected || element.getRootNode() !== document
    || element.hasAttribute("data-marquee-running") || (element as Owned)[owner]) throw new TypeError("Use an unowned static native .mui-marquee[data-marquee] scope, never the obsolete marquee element.")
  const win = view, doc = document!, token = {}, writes = ownedWrites()
  const own = (node: Element) => node.closest("[data-marquee]") === element
  function one(selector: string) {
    const nodes = [...element.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (nodes.length !== 1) throw new TypeError(`Author exactly one ${selector}.`)
    return nodes[0]!
  }
  function named(node: HTMLElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => doc.getElementById(id)?.textContent?.trim()))
  }
  const viewport = one("[data-marquee-viewport]"), content = one("[data-marquee-content]"),
    controls = one("[data-marquee-controls]"), buttonNode = one("[data-marquee-toggle]"),
    label = one("[data-marquee-label]"), status = one("[data-marquee-status]")
  if (!named(element) || !named(viewport) || viewport.getAttribute("tabindex") !== "0" || viewport.parentElement !== element
    || !["div", "section"].includes(viewport.localName) || !["div", "p"].includes(content.localName) || content.parentElement !== viewport
    || !(buttonNode instanceof win.HTMLButtonElement) || buttonNode.getAttribute("type") !== "button" || !controls.contains(buttonNode)
    || viewport.contains(controls) || !controls.hidden || !buttonNode.contains(label) || label.childNodes.length !== 1
    || label.firstChild?.nodeType !== win.Node.TEXT_NODE || !label.textContent?.trim()
    || buttonNode.hasAttribute("role") || buttonNode.hasAttribute("popovertarget") || buttonNode.hasAttribute("commandfor")
    || buttonNode.querySelector("input,button,select,textarea,a,[tabindex],[contenteditable]")
    || !["p", "span", "div"].includes(status.localName) || status.childElementCount || status.hasAttribute("role") || status.hasAttribute("aria-live")
    || viewport.contains(status)) throw new TypeError("Author a named native scroll viewport, one original track, hidden type=button controls with a plain label, and separate nonlive status.")
  const button = buttonNode, labelText = label.firstChild as Text
  const beforeLabel = labelText.data, beforeStatus = status.textContent
  let lastLabel = beforeLabel, lastStatus = beforeStatus, lastNotice = ""
  let settings: Required<MarqueeSettings> = { active: false, speed: 48, direction: "left", iterations: 1, delay: 0,
    playLabel: "Play motion", pauseLabel: "Pause motion and use static view" }
  let connected = true, applying = false, generation = 0, finished = false, hovering = viewport.matches(":hover")
  let error: unknown = null, failed = false, animation: Animation | null = null, pauseReasons: string[] = []
  let viewportWidth = 0, contentWidth = 0, distance = 0, duration = 0, signature = ""
  const supported = typeof content.animate === "function"
  const reduce = win.matchMedia?.("(prefers-reduced-motion: reduce)"), forced = win.matchMedia?.("(forced-colors: active)"), print = win.matchMedia?.("print")
  const listeners: (() => void)[] = []
  let resize: ResizeObserver | undefined
  const nodes = [element, viewport, content, controls, button, label, status]
  function config(input: MarqueeSettings) {
    if (!input || typeof input !== "object" || Array.isArray(input)
      || Object.keys(input).some(key => !["active", "speed", "direction", "iterations", "delay", "playLabel", "pauseLabel"].includes(key))) throw new TypeError("Unsupported Marquee settings.")
    const next = { ...settings, ...input }
    if (typeof next.active !== "boolean" || !Number.isFinite(next.speed) || next.speed < 1 || next.speed > 1000
      || !["left", "right"].includes(next.direction) || next.iterations !== "infinite" && (!Number.isInteger(next.iterations) || next.iterations < 1 || next.iterations > 100)
      || !Number.isFinite(next.delay) || next.delay < 0 || next.delay > 60000
      || [next.playLabel, next.pauseLabel].some(value => typeof value !== "string" || !value.trim() || value.length > 120)) {
      throw new TypeError("Use speed 1..1000 CSS px/s, left/right, 1..100 passes or infinite, delay 0..60000ms and readable labels.")
    }
    return next
  }
  function intact() {
    return element.isConnected && element.getRootNode() === doc && nodes.every(node => node === element || element.contains(node))
      && content.parentElement === viewport && viewport.parentElement === element && labelText.parentNode === label && label.childNodes.length === 1
      && button.getAttribute("type") === "button"
  }
  function validateContent() {
    if (content.textContent!.length > 16384) throw new RangeError("Marquee text is limited to 16,384 UTF-16 units.")
    const walker = doc.createTreeWalker(content, win.NodeFilter.SHOW_ELEMENT)
    let count = 0, node: Node | null
    while ((node = walker.nextNode())) {
      const child = node as HTMLElement
      if (++count > 200) throw new RangeError("Marquee content is limited to 200 native phrasing elements.")
      if (!contentTags.has(child.localName) || child.hasAttribute("tabindex") || child.hasAttribute("contenteditable")
        || child.hasAttribute("autofocus") || child.hasAttribute("is") || child.hasAttribute("role")
        || child.hasAttribute("data-marquee")) throw new TypeError("Moving Marquee content is noninteractive native text/phrasing/images only; unsupported content stays static.")
      if (child.localName === "img" && !child.hasAttribute("alt")) throw new TypeError("Authored images need explicit alt text (empty is valid for decoration).")
    }
    if (content.hasAttribute("tabindex") || content.hasAttribute("contenteditable") || content.hasAttribute("role")) throw new TypeError("Do not make the moving track interactive; use the named static viewport.")
  }
  function selected() {
    const selection = doc.getSelection()
    if (!selection || selection.isCollapsed) return false
    for (let i = 0; i < selection.rangeCount; ++i) {
      try { if (selection.getRangeAt(i).intersectsNode(content)) return true } catch { /* Detached ranges are not owned. */ }
    }
    return false
  }
  function reasons() {
    const result: string[] = []
    if (!settings.active) result.push("user")
    if (!supported) result.push("unsupported")
    if (!reduce || reduce.matches) result.push("reduced-motion")
    if (forced?.matches) result.push("forced-colors")
    if (print?.matches) result.push("print")
    if (doc.hidden) result.push("document-hidden")
    if (hovering) result.push("hover")
    if (viewport.contains(doc.activeElement) || doc.activeElement === element) result.push("focus")
    if (selected()) result.push("selection")
    if (content.closest(liveRegion)) result.push("live-region")
    if (button.matches(":disabled") || button.tabIndex < 0) result.push("control-unavailable")
    for (let node: HTMLElement | null = button; node; node = node.parentElement) {
      const css = win.getComputedStyle(node)
      if (node.hidden || node.hasAttribute("inert") || node.getAttribute("aria-hidden") === "true"
        || css.display === "none" || css.visibility === "hidden" || css.contentVisibility === "hidden"
        || node.localName === "dialog" && !(node as HTMLDialogElement).open
        || node.localName === "details" && !(node as HTMLDetailsElement).open && !node.firstElementChild?.contains(button)) {
        result.push("control-unavailable"); break
      }
    }
    for (let node: HTMLElement | null = viewport; node; node = node.parentElement) {
      const css = win.getComputedStyle(node)
      if (node.hidden || node.hasAttribute("inert") || css.display === "none" || css.visibility === "hidden" || css.contentVisibility === "hidden"
        || node.localName === "dialog" && !(node as HTMLDialogElement).open
        || node.localName === "details" && !(node as HTMLDetailsElement).open && !node.firstElementChild?.contains(element)) {
        result.push("hidden"); break
      }
    }
    return result
  }
  function stop() {
    if (animation || element.hasAttribute("data-marquee-running")) ++generation
    const previous = animation; animation = null
    if (previous) { previous.onfinish = null; previous.oncancel = null; previous.cancel() }
    writes.attr(element, "data-marquee-running", null)
  }
  function state(): MarqueeState {
    return Object.freeze({ active: settings.active, phase: !connected ? "disconnected" : failed ? "error" : animation ? "running" : finished ? "finished" : "static",
      pauseReasons: Object.freeze([...pauseReasons]), supported, generation, viewportWidth, contentWidth, distance, duration,
      direction: settings.direction, iterations: settings.iterations, error })
  }
  function renderStatus() {
    const text = settings.active ? settings.pauseLabel : settings.playLabel
    if (labelText.data !== text) labelText.data = text
    lastLabel = text
    writes.attr(button, "aria-label", text)
    const next = state()
    const message = next.phase === "running" ? `Motion: ${settings.direction}, ${settings.speed} CSS px/s. Pause for full native scrolling.`
      : next.phase === "error" ? "Motion stopped after an error; the original content is available in static view."
        : next.phase === "finished" ? "Motion completed; full content is available in static view."
          : `Static view; full content is reachable by native scrolling. ${pauseReasons.length ? `Paused: ${pauseReasons.join(", ")}.` : ""}`
    if (status.textContent !== message) status.textContent = message
    lastStatus = message
  }
  function notify(name = "mui:marquee-change") {
    if (!connected || !intact()) return
    const detail = state(), key = JSON.stringify(detail)
    if (name === "mui:marquee-change" && key === lastNotice) return
    lastNotice = key
    element.dispatchEvent(new win.CustomEvent(name, { bubbles: true, detail }))
  }
  function geometry() {
    const width = viewport.clientWidth, natural = content.offsetWidth, offset = content.offsetLeft
    if (![width, natural, offset].every(Number.isFinite) || width < 0 || natural < 0 || width > 100000 || natural > 100000 || Math.abs(offset) > 100000) throw new RangeError("Marquee geometry is limited to 100,000 layout CSS pixels.")
    viewportWidth = width; contentWidth = natural; distance = Math.max(0, natural - width)
    duration = distance / settings.speed * 1000
    if (!width || !natural || !viewport.clientHeight) return { key: "", from: 0, to: 0, unavailable: "zero-size" }
    const viewStyle = win.getComputedStyle(viewport), trackStyle = win.getComputedStyle(content)
    if (viewStyle.position !== "relative" || trackStyle.position !== "static"
      || [viewStyle, trackStyle].some(style => style.writingMode && style.writingMode !== "horizontal-tb"
        || ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"].some(key => parseFloat(style[key as keyof CSSStyleDeclaration] as string) > 0))
      || ["marginLeft", "marginRight"].some(key => parseFloat(trackStyle[key as keyof CSSStyleDeclaration] as string) !== 0)
      || viewStyle.transform && viewStyle.transform !== "none"
      || !animation && (trackStyle.transform && trackStyle.transform !== "none" || trackStyle.animationName && trackStyle.animationName !== "none")
      || content.offsetParent !== viewport) throw new TypeError("Use the external positioned borderless/paddingless viewport and static untransformed max-content track; no competing track animation.")
    const left = -offset, right = -distance - offset
    if (![left, right, duration].every(Number.isFinite) || Math.abs(left) > 100000 || Math.abs(right) > 100000 || duration > 100000000) throw new RangeError("Invalid or oversized native traversal.")
    return { key: `${width}:${natural}:${offset}:${settings.direction}`, from: settings.direction === "left" ? left : right,
      to: settings.direction === "left" ? right : left, unavailable: distance <= 1 ? "fits" : duration < 100 ? "short-travel" : null }
  }
  function reconcile(reason: string, force = false) {
    if (!connected) return
    if (!intact()) { disconnect(); return }
    if (applying) return
    applying = true
    let failure: unknown, didFail = false, changed = false
    try {
      validateContent()
      pauseReasons = reasons()
      if (pauseReasons.length) { stop(); error = null; failed = false; renderStatus(); changed = true; return }
      if (force) stop()
      const measured = geometry()
      if (measured.unavailable) {
        stop(); pauseReasons = [measured.unavailable]; signature = measured.key; error = null; failed = false; renderStatus(); changed = true; return
      }
      if (animation && measured.key === signature && !force) return
      stop()
      const measuredStatic = geometry()
      if (measuredStatic.unavailable) { pauseReasons = [measuredStatic.unavailable]; renderStatus(); changed = true; return }
      signature = measuredStatic.key
      viewport.scrollLeft = 0
      writes.attr(element, "data-marquee-running", "")
      ++generation
      const current = content.animate([
        { transform: `translateX(${measuredStatic.from}px)` },
        { transform: `translateX(${measuredStatic.to}px)` },
      ], { duration, delay: settings.delay, iterations: settings.iterations === "infinite" ? Infinity : settings.iterations,
        direction: "alternate", easing: "linear", fill: "both" })
      if (!connected || !intact()) { current.cancel(); disconnect(); return }
      animation = current; error = null; failed = false; finished = false
      const stamp = generation
      current.onfinish = () => {
        if (!connected || animation !== current || generation !== stamp) return
        if (!intact()) { disconnect(); return }
        stop(); settings.active = false; finished = true; pauseReasons = []; renderStatus()
        notify("mui:marquee-finish")
      }
      current.oncancel = () => {
        if (!connected || animation !== current || generation !== stamp) return
        animation = null; ++generation; settings.active = false; finished = false; pauseReasons = ["cancelled"]
        writes.attr(element, "data-marquee-running", null); renderStatus(); notify()
      }
      renderStatus()
      changed = true
    } catch (caught) {
      stop(); error = caught; failed = true; pauseReasons = ["error"]; renderStatus(); failure = caught; didFail = true
    } finally {
      applying = false
      if (didFail) element.dispatchEvent(new win.CustomEvent("mui:marquee-error", { bubbles: true, detail: Object.freeze({ error: failure, reason }) }))
      else if (changed) notify()
    }
    if (didFail) throw failure
  }
  function safe(reason: string, force = false) { try { reconcile(reason, force) } catch { /* Error event/state already reports a static fallback. */ } }
  function live() {
    if (!connected) throw new Error("Marquee is disconnected.")
    if (applying) throw new Error("Do not reenter Marquee during measurement; disconnect is allowed.")
    if (!intact()) { disconnect(); throw new Error("Marquee anatomy was replaced or removed.") }
  }
  function set(input: MarqueeSettings) {
    live(); const next = config(input)
    settings = next; if (Object.hasOwn(input, "active")) finished = false
    reconcile("settings", true)
  }
  function listen(node: EventTarget, name: string, callback: EventListener, capture = false) {
    node.addEventListener(name, callback, capture); listeners.push(() => node.removeEventListener(name, callback, capture))
  }
  const mutation = new win.MutationObserver(records => {
    if (!intact()) { disconnect(); return }
    const changed = records.some(record => content.contains(record.target))
    const ancestor = records.some(record => record.target instanceof win.Element && (record.target.contains(viewport) || record.target.contains(button)))
    if (changed || ancestor) safe(changed ? "content" : "environment", true)
  })
  function disconnect() {
    if (!connected) return
    connected = false; stop(); resize?.disconnect(); mutation.disconnect(); listeners.forEach(remove => remove())
    writes.restore()
    if (labelText.parentNode === label && labelText.data === lastLabel) labelText.data = beforeLabel
    if (status.textContent === lastStatus) status.textContent = beforeStatus
    if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
  }
  settings = config(options); validateContent()
  ;(element as Owned)[owner] = token
  writes.attr(controls, "hidden", supported ? null : "")
  listen(viewport, "pointerenter", () => { hovering = true; safe("hover") })
  listen(viewport, "pointerleave", () => { hovering = false; safe("hover") })
  listen(doc, "focusin", () => safe("focus"))
  listen(doc, "focusout", () => win.queueMicrotask(() => safe("focus")))
  listen(doc, "selectionchange", () => safe("selection"))
  listen(doc, "visibilitychange", () => safe("visibility"))
  listen(doc, "toggle", () => safe("toggle"), true)
  listen(content, "load", () => safe("load", true), true)
  listen(win, "resize", () => safe("resize"))
  for (const media of [reduce, forced, print]) if (media) listen(media, "change", () => safe("media", true))
  if (doc.fonts) listen(doc.fonts, "loadingdone", () => safe("fonts", true))
  listen(button, "click", () => {
    if (button.matches(":disabled")) return
    try { set({ active: !settings.active }) } catch { /* Already reported. */ }
  })
  resize = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(() => safe("resize")) : undefined
  resize?.observe(viewport); resize?.observe(content)
  mutation.observe(doc.documentElement, { childList: true, characterData: true, subtree: true, attributes: true,
    attributeFilter: ["hidden", "inert", "open", "dir", "class", "style", "src", "alt", "width", "height", "aria-live", "aria-hidden", "role", "tabindex", "contenteditable", "disabled", "autofocus", "is"] })
  safe("initial", true)
  return { element, viewport, content, get connected() { return connected }, get state() { return state() },
    set, play: () => set({ active: true }), pause: () => set({ active: false }), refresh() { live(); reconcile("refresh", true) }, disconnect }
}
