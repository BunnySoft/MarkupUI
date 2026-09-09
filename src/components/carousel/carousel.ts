import { ownedWrites } from "../popover/position.js"

export interface CarouselSettings {
  currentIndex?: number
  defaultIndex?: number
  direction?: "horizontal" | "vertical"
  loop?: boolean
  autoplay?: boolean
  interval?: number
  keyboard?: boolean
  smooth?: boolean
  disabled?: boolean
}
export interface CarouselOptions extends CarouselSettings {
  onUpdateCurrentIndex?: (index: number, previousIndex: number, change: CarouselChange) => void
}
export interface CarouselChange {
  readonly index: number
  readonly previousIndex: number
  readonly slide: HTMLElement | null
  readonly previousSlide: HTMLElement | null
  readonly reason: "api" | "control" | "autoplay" | "scroll" | "refresh"
}
export interface CarouselState {
  readonly currentIndex: number
  readonly targetIndex: number | null
  readonly defaultIndex: number
  readonly total: number
  readonly direction: "horizontal" | "vertical"
  readonly playing: boolean
  readonly paused: boolean
  readonly pauseReasons: readonly string[]
  readonly disabled: boolean
  readonly ready: boolean
}
export interface CarouselController {
  readonly element: HTMLElement
  readonly viewport: HTMLElement
  readonly slides: readonly HTMLElement[]
  readonly connected: boolean
  readonly state: CarouselState
  getCurrentIndex(): number
  to(index: number): void
  prev(): void
  next(): void
  play(): void
  pause(): void
  set(settings: CarouselSettings): void
  reset(): void
  refresh(): void
  disconnect(): void
}
const owner = Symbol.for("markup-ui.carousel.owner")
type Owned = HTMLElement & { [owner]?: object }
const keys = ["currentIndex", "defaultIndex", "direction", "loop", "autoplay", "interval", "keyboard", "smooth", "disabled"]

/** Enhances authored, single-slide-per-view native scrolling without a slide renderer. */
export function createCarousel(element: HTMLElement, options: CarouselOptions = {}): CarouselController {
  const document = element?.ownerDocument, view = document?.defaultView
  if (!view || !(element instanceof view.HTMLElement) || !element.matches(".mui-carousel[data-carousel]")
    || !["div", "section"].includes(element.localName) || (element as Owned)[owner]
    || !element.isConnected || element.getRootNode() !== document || element.closest("mui-carousel")) {
    throw new TypeError("Use an unowned connected native div/section.mui-carousel[data-carousel].")
  }
  const win = view, doc = document!, token = {}, writes = ownedWrites(), itemWrites = ownedWrites()
  const own = (node: Element) => node.closest("[data-carousel]") === element
  const find = (selector: string) => [...element.querySelectorAll<HTMLElement>(selector)].filter(own)
  function named(node: HTMLElement) {
    return !!(node.getAttribute("aria-label")?.trim() || node.getAttribute("aria-labelledby")?.trim().split(/\s+/).every(id => doc.getElementById(id)?.textContent?.trim()))
  }
  const viewports = find("[data-carousel-viewport]"), controls = find("[data-carousel-controls]"), readouts = find("[data-carousel-readout]")
  if (!named(element) || element.hasAttribute("role") && element.getAttribute("role") !== "region"
    || viewports.length !== 1 || controls.length > 1 || readouts.length !== 1) throw new TypeError("Author a named region, one viewport/readout and at most one controls container.")
  const viewport = viewports[0]!, readout = readouts[0]!, control = controls[0]
  if (viewport.parentElement !== element || !["div", "section"].includes(viewport.localName) || !named(viewport)
    || viewport.getAttribute("tabindex") !== "0" || !viewport.id
    || viewport.hasAttribute("role") && viewport.getAttribute("role") !== "group"
    || control && (control.parentElement !== element || !control.hidden)
    || readout.childElementCount || viewport.contains(readout) || readout.closest("button,output")
    || !["p", "span", "div"].includes(readout.localName)) throw new TypeError("Use a direct named tabindex=0 viewport with ID, hidden controls, and separate plain-text readout.")
  const originalText = readout.textContent
  let lastText: string | null = null
  let settings: Required<CarouselSettings> = {
    currentIndex: 0, defaultIndex: 0, direction: element.dataset.carouselDirection === "vertical" ? "vertical" : "horizontal",
    loop: true, autoplay: false, interval: 5000, keyboard: true, smooth: true, disabled: false,
  }
  let slides: HTMLElement[] = [], buttons: HTMLButtonElement[] = [], index = -1, current: HTMLElement | null = null
  const authoredDisabled = new WeakMap<HTMLButtonElement, boolean>()
  let target: number | null = null, reason: CarouselChange["reason"] = "scroll", silent = false
  let connected = true, generation = 0, observerVersion = 0, userPaused = false, hovering = false, interacting = false
  let autoTimer = 0, settleTimer = 0, focusTimer = 0
  let resize: ResizeObserver | undefined, removal: MutationObserver | undefined
  const media = win.matchMedia?.("(prefers-reduced-motion: reduce)")
  const listeners: (() => void)[] = []
  function object(value: unknown, allowed: string[]) {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new TypeError("Unsupported Carousel options.")
  }
  function config(input: CarouselSettings) {
    object(input, keys)
    const next = { ...settings, ...input }
    for (const key of ["currentIndex", "defaultIndex"] as const) if (!Number.isSafeInteger(next[key])) throw new RangeError(`${key} must be a safe integer.`)
    for (const key of ["loop", "autoplay", "keyboard", "smooth", "disabled"] as const) if (typeof next[key] !== "boolean") throw new TypeError(`${key} must be boolean.`)
    if (!["horizontal", "vertical"].includes(next.direction)) throw new TypeError("Use horizontal or vertical.")
    if (!Number.isInteger(next.interval) || next.interval < 1000 || next.interval > 2147483647) throw new RangeError("interval must be 1000..2147483647 milliseconds.")
    if (next.autoplay && !buttons.some(button => button.hasAttribute("data-carousel-toggle"))) throw new TypeError("Autoplay requires an authored labelled pause/play button.")
    return next
  }
  function anatomy() {
    if (!element.isConnected || viewport.parentElement !== element || !element.contains(readout)
      || control && control.parentElement !== element) throw new Error("Carousel anatomy was detached; disconnect and rebind replacement anatomy.")
    const items = [...viewport.children]
    if (items.some(node => !(node instanceof win.HTMLElement) || !["div", "section", "article"].includes(node.localName)
      || !node.hasAttribute("data-carousel-item") || !own(node) || node.hasAttribute("hidden") || node.hasAttribute("inert")
      || node.hasAttribute("aria-hidden") || node.hasAttribute("role") && node.getAttribute("role") !== "group")) {
      throw new TypeError("Viewport children must be visible native CarouselItem div/section/article nodes, not hidden or cloned options.")
    }
    const actions = find("[data-carousel-prev],[data-carousel-next],[data-carousel-to],[data-carousel-toggle]")
    const seen = new Set<string>()
    for (const node of actions) {
      const attrs = ["data-carousel-prev", "data-carousel-next", "data-carousel-to", "data-carousel-toggle"].filter(name => node.hasAttribute(name))
      const key = attrs[0] === "data-carousel-to" ? `to:${node.getAttribute(attrs[0])}` : attrs[0]!
      if (!(node instanceof win.HTMLButtonElement) || !control?.contains(node) || node.getAttribute("type") !== "button"
        || node.hasAttribute("role") || node.hasAttribute("popovertarget") || node.hasAttribute("commandfor")
        || node.closest("label,summary") || node.querySelector("button,a,input,select,textarea,[tabindex],[contenteditable]")
        || !(named(node) || node.textContent?.trim()) || attrs.length !== 1 || seen.has(key)
        || attrs[0] === "data-carousel-to" && !/^(0|[1-9]\d*)$/.test(node.getAttribute("data-carousel-to")!)) {
        throw new TypeError("Author distinct labelled type=button actions inside hidden enhancement controls; indicators use nonnegative decimal indices.")
      }
      seen.add(key)
      if (!authoredDisabled.has(node as HTMLButtonElement)) authoredDisabled.set(node as HTMLButtonElement, (node as HTMLButtonElement).disabled)
    }
    return { items: items as HTMLElement[], actions: actions as HTMLButtonElement[] }
  }
  function unchanged() { return slides.length === viewport.children.length && slides.every((slide, i) => viewport.children[i] === slide) }
  function live() { if (!connected) throw new Error("Carousel is disconnected."); if (!element.isConnected) { disconnect(); throw new Error("Carousel was removed."); } }
  function clamp(value: number) { return slides.length ? Math.max(0, Math.min(slides.length - 1, value)) : -1 }
  function geometry() {
    if (!element.isConnected || element.closest("[hidden],[inert]") || !unchanged()) return null
    for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.localName === "details" && !(ancestor as HTMLDetailsElement).open && !ancestor.firstElementChild?.contains(element)) return null
      if (win.getComputedStyle(ancestor).contentVisibility === "hidden") return null
    }
    const css = win.getComputedStyle(viewport), vertical = settings.direction === "vertical"
    const extent = vertical ? viewport.clientHeight : viewport.clientWidth
    if (!(extent > 0) || !viewport.clientWidth || !viewport.clientHeight || css.visibility === "hidden" || css.display === "none"
      || css.writingMode && css.writingMode !== "horizontal-tb") return null
    const first = slides[0], start = first ? vertical ? first.offsetTop : first.offsetLeft : 0
    const points = slides.map(slide => (vertical ? slide.offsetTop : slide.offsetLeft) - start)
    const sign = !vertical && css.direction === "rtl" ? -1 : 1
    if (points.some((point, i) => !Number.isFinite(point) || Math.abs(point - i * extent * sign) > Math.max(2, i)
      || Math.abs((vertical ? slides[i]!.offsetHeight : slides[i]!.offsetWidth) - extent) > 1)) return null
    return { points, vertical, position: vertical ? viewport.scrollTop : viewport.scrollLeft }
  }
  function pauseReasons() {
    const reasons: string[] = []
    if (!settings.autoplay) reasons.push("not-enabled")
    if (userPaused) reasons.push("user")
    if (settings.disabled || !connected) reasons.push("disabled")
    if (hovering) reasons.push("hover")
    if (element.contains(doc.activeElement)) reasons.push("focus")
    if (doc.hidden) reasons.push("document-hidden")
    if (!media || media.matches) reasons.push("reduced-motion")
    if (interacting || target !== null || settleTimer) reasons.push("scroll")
    if (slides.length < 2) reasons.push("insufficient-slides")
    if (!settings.loop && index === slides.length - 1) reasons.push("boundary")
    const rotation = buttons.find(button => button.hasAttribute("data-carousel-toggle"))
    let availableControl = !!rotation?.isConnected && !!control?.contains(rotation) && !rotation.closest("[hidden],[inert]")
      && !(rotation.matches(":disabled") && !settings.disabled)
    for (let node: HTMLElement | null = rotation ?? null; availableControl && node && node !== element; node = node.parentElement) {
      const style = win.getComputedStyle(node)
      if (style.display === "none" || style.visibility === "hidden" || style.contentVisibility === "hidden") availableControl = false
    }
    if (settings.autoplay && !availableControl) reasons.push("rotation-control")
    if (!geometry()) reasons.push("layout")
    return reasons
  }
  function state(): CarouselState {
    const reasons = pauseReasons()
    return Object.freeze({ currentIndex: index, targetIndex: target, defaultIndex: settings.defaultIndex, total: slides.length,
      direction: settings.direction, playing: reasons.length === 0, paused: userPaused, pauseReasons: Object.freeze(reasons),
      disabled: settings.disabled, ready: geometry() !== null })
  }
  function unavailable(button: HTMLButtonElement) {
    const base = target ?? index
    return settings.disabled || slides.length < 2 || !geometry()
      || button.hasAttribute("data-carousel-prev") && !settings.loop && base <= 0
      || button.hasAttribute("data-carousel-next") && !settings.loop && base >= slides.length - 1
      || button.hasAttribute("data-carousel-to") && Number(button.dataset.carouselTo) >= slides.length
  }
  function render() {
    writes.attr(element, "role", "region"); writes.attr(element, "aria-roledescription", "carousel")
    writes.attr(element, "data-carousel-direction", settings.direction)
    writes.attr(viewport, "role", "group")
    // Only the separate readout announces settled manual moves; slide content is never a live region.
    writes.attr(readout, "aria-live", settings.autoplay && !userPaused ? "off" : "polite")
    writes.attr(readout, "aria-atomic", "true")
    lastText = slides.length ? `${index + 1} / ${slides.length}` : "0 / 0"
    if (readout.textContent !== lastText) readout.textContent = lastText
    const previousIndex = index > 0 ? index - 1 : settings.loop && slides.length > 1 ? slides.length - 1 : -1
    const nextIndex = index < slides.length - 1 ? index + 1 : settings.loop && slides.length > 1 ? 0 : -1
    slides.forEach((slide, i) => {
      itemWrites.attr(slide, "role", "group"); itemWrites.attr(slide, "aria-roledescription", "slide")
      itemWrites.attr(slide, "data-carousel-index", String(i))
      itemWrites.attr(slide, "data-carousel-current", i === index ? "" : null)
      itemWrites.attr(slide, "data-carousel-previous-slide", i === previousIndex ? "" : null)
      itemWrites.attr(slide, "data-carousel-next-slide", i === nextIndex ? "" : null)
      if (!named(slide)) itemWrites.attr(slide, "aria-label", `${i + 1} of ${slides.length}`)
    })
    if (control) writes.attr(control, "hidden", null)
    for (const button of buttons) {
      const toggle = button.hasAttribute("data-carousel-toggle")
      const blocked = authoredDisabled.get(button) || (toggle ? settings.disabled || !settings.autoplay : unavailable(button))
      // Keep a focused boundary button in the tab order, but guard all activation.
      writes.attr(button, "disabled", blocked && doc.activeElement !== button ? "" : null)
      writes.attr(button, "aria-disabled", blocked ? "true" : null)
      writes.attr(button, "aria-controls", viewport.id)
      if (button.hasAttribute("data-carousel-to")) writes.attr(button, "aria-current", Number(button.dataset.carouselTo) === index ? "true" : null)
      if (toggle) writes.attr(button, "aria-label", userPaused ? "Play slide rotation" : "Pause slide rotation")
    }
  }
  function schedule() {
    win.clearTimeout(autoTimer); autoTimer = 0
    if (!connected) return
    if (target !== null && reason === "autoplay" && pauseReasons().some(value => value !== "scroll")) {
      scroll(settings.direction === "vertical" ? viewport.scrollTop : viewport.scrollLeft, false)
      target = null; silent = true; reason = "scroll"; debounce()
    }
    render()
    if (!pauseReasons().length) {
      const version = generation
      autoTimer = win.setTimeout(() => {
        autoTimer = 0
        if (connected && version === generation && !pauseReasons().length) command((target ?? index) + 1, "autoplay")
      }, settings.interval)
    }
  }
  function change(next: number, why: CarouselChange["reason"], quiet: boolean) {
    const previousIndex = index, previousSlide = current
    index = next; current = slides[index] ?? null
    schedule()
    if (quiet || previousIndex === index && previousSlide === current) return
    const detail: CarouselChange = Object.freeze({ index, previousIndex, slide: current, previousSlide, reason: why })
    const version = generation
    element.dispatchEvent(new win.CustomEvent("mui:carousel-change", { bubbles: true, detail }))
    if (connected && element.isConnected && version === generation) options.onUpdateCurrentIndex?.(index, previousIndex, detail)
  }
  function stopTimers() {
    ++generation
    win.clearTimeout(autoTimer); win.clearTimeout(settleTimer); win.clearTimeout(focusTimer)
    autoTimer = settleTimer = focusTimer = 0
  }
  function scroll(position: number, smooth: boolean) {
    viewport.scrollTo({ left: settings.direction === "horizontal" ? position : 0,
      top: settings.direction === "vertical" ? position : 0, behavior: smooth ? "smooth" : "instant" })
  }
  function nearest() {
    const g = geometry()
    if (!g || !g.points.length) return g ? -1 : null
    return g.points.reduce((best, point, i) => Math.abs(point - g.position) < Math.abs(g.points[best]! - g.position) ? i : best, 0)
  }
  function settle() {
    win.clearTimeout(settleTimer); settleTimer = 0
    if (!connected || settings.disabled) return
    const next = nearest()
    if (next === null) { schedule(); return }
    const why = reason, quiet = silent
    target = null; reason = "scroll"; silent = false
    change(next, why, quiet)
  }
  function debounce() {
    win.clearTimeout(settleTimer)
    const version = generation
    settleTimer = win.setTimeout(() => { if (connected && version === generation) settle() }, 180)
  }
  function command(value: number, why: CarouselChange["reason"], quiet = false, instant = false) {
    live()
    if (!Number.isSafeInteger(value)) throw new RangeError("index must be a safe integer.")
    if (settings.disabled) return
    if (!unchanged()) throw new Error("Refresh Carousel after changing its slide nodes.")
    stopTimers()
    const wrapped = settings.loop && slides.length ? ((value % slides.length) + slides.length) % slides.length : clamp(value)
    target = wrapped; reason = why; silent = quiet
    const g = geometry()
    if (!g || wrapped < 0) { if (wrapped < 0) { target = null; change(-1, why, quiet) } else schedule(); return }
    const smooth = settings.smooth && !instant && !!media && !media.matches
    scroll(g.points[wrapped]!, smooth)
    if (!smooth || Math.abs(g.position - g.points[wrapped]!) <= 1) settle()
    else { debounce(); schedule() }
  }
  function interrupt() {
    if (!connected || settings.disabled) return
    ++generation; target = null; silent = false; reason = "scroll"
    debounce(); schedule()
  }
  function listen(node: EventTarget, type: string, callback: EventListener, options?: AddEventListenerOptions) {
    node.addEventListener(type, callback, options)
    listeners.push(() => node.removeEventListener(type, callback, options))
  }
  function realign() {
    if (geometry()) command(target ?? Math.max(0, index), target === null ? "refresh" : reason, target === null || silent, true)
    else schedule()
  }
  function observers() {
    const version = ++observerVersion
    resize?.disconnect(); removal?.disconnect()
    if (!connected || settings.disabled) return
    resize = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(() => {
      if (!connected || settings.disabled || version !== observerVersion) return
      realign()
    }) : undefined
    resize?.observe(viewport)
    removal = new win.MutationObserver(() => { if (version === observerVersion && !element.isConnected) disconnect() })
    removal.observe(doc.documentElement, { childList: true, subtree: true })
  }
  function refresh() {
    live()
    const next = anatomy(), prior = current, priorIndex = index, requested = target === null ? current : slides[target]
    if (settings.autoplay && !next.actions.some(button => button.hasAttribute("data-carousel-toggle"))) throw new TypeError("Retain the autoplay pause/play control.")
    stopTimers(); resize?.disconnect(); removal?.disconnect()
    itemWrites.restore(); writes.restore()
    slides = next.items; buttons = next.actions
    buttons.forEach(button => authoredDisabled.set(button, button.disabled))
    index = slides.includes(prior!) ? slides.indexOf(prior!) : clamp(index)
    const desired = slides.includes(requested!) ? slides.indexOf(requested!) : index
    target = null; interacting = false; hovering = element.matches(":hover")
    render(); observers()
    current = slides[index] ?? null
    if (!settings.disabled) command(Math.max(0, desired), "refresh", true, true)
    else schedule()
    if (prior !== current || priorIndex !== index) {
      const nextIndex = index
      current = prior; index = priorIndex
      change(nextIndex, "refresh", false)
    }
  }
  function disconnect() {
    if (!connected) return
    stopTimers(); connected = false
    resize?.disconnect(); removal?.disconnect()
    for (const remove of listeners) remove()
    if (typeof viewport.scrollTo === "function") scroll(settings.direction === "vertical" ? viewport.scrollTop : viewport.scrollLeft, false)
    itemWrites.restore(); writes.restore()
    if (readout.textContent === lastText) readout.textContent = originalText
    if ((element as Owned)[owner] === token) delete (element as Owned)[owner]
    target = null
  }
  object(options, [...keys, "onUpdateCurrentIndex"])
  if (options.onUpdateCurrentIndex !== undefined && typeof options.onUpdateCurrentIndex !== "function") throw new TypeError("onUpdateCurrentIndex must be a function.")
  const initial = anatomy(); slides = initial.items; buttons = initial.actions
  const { onUpdateCurrentIndex: _callback, ...input } = options
  settings = config(input)
  if (typeof viewport.scrollTo !== "function") throw new Error("Native Element.scrollTo is required; leave the plain scrolling fallback unenhanced.")
  index = clamp(options.currentIndex ?? settings.defaultIndex); current = slides[index] ?? null
  hovering = element.matches(":hover")
  ;(element as Owned)[owner] = token
  listen(viewport, "scroll", event => { if (event.target === viewport && !settings.disabled) { debounce(); schedule() } }, { passive: true })
  listen(viewport, "scrollend", event => {
    if (event.target !== viewport || settings.disabled) return
    if (target === null || nearest() === target) settle()
    else debounce()
  })
  listen(viewport, "wheel", event => { if (event.target instanceof win.Element && event.target.closest("[data-carousel]") === element) interrupt() }, { passive: true })
  listen(element, "pointerenter", () => { hovering = true; schedule() })
  listen(element, "pointerleave", () => { hovering = false; schedule() })
  listen(viewport, "pointerdown", () => { interacting = true; interrupt() }, { passive: true })
  listen(doc, "pointerup", () => { if (interacting) { interacting = false; schedule() } }, { passive: true })
  listen(doc, "pointercancel", () => { if (interacting) { interacting = false; schedule() } }, { passive: true })
  listen(element, "focusin", () => schedule())
  listen(element, "focusout", () => {
    if (settings.disabled) return
    win.clearTimeout(focusTimer)
    focusTimer = win.setTimeout(() => { focusTimer = 0; schedule() }, 0)
  })
  listen(doc, "visibilitychange", () => schedule())
  listen(doc, "toggle", event => {
    if (!(event.target instanceof win.HTMLDetailsElement) || !event.target.contains(element) || settings.disabled) return
    if (event.target.open) realign()
    else schedule()
  }, { capture: true })
  if (media) listen(media, "change", () => {
    if (media.matches && target !== null) command(target, reason, silent, true)
    else schedule()
  })
  listen(win, "resize", () => { if (!resize && !settings.disabled) realign() })
  listen(viewport, "keydown", event => {
    const key = event as KeyboardEvent
    if (key.target !== viewport || !settings.keyboard || settings.disabled || key.altKey || key.ctrlKey || key.metaKey || key.shiftKey || key.isComposing) return
    const rtl = win.getComputedStyle(viewport).direction === "rtl", vertical = settings.direction === "vertical"
    let next: number | undefined
    if (key.key === "Home") next = 0
    else if (key.key === "End") next = slides.length - 1
    else if (key.key === (vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight")) next = (target ?? index) + 1
    else if (key.key === (vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft")) next = (target ?? index) - 1
    if (next !== undefined) { key.preventDefault(); command(next, "control") }
  })
  listen(element, "click", event => {
    const node = event.target instanceof win.Element ? event.target.closest("button") : null
    if (!(node instanceof win.HTMLButtonElement) || !buttons.includes(node)) return
    if (node.matches(":disabled") || node.getAttribute("aria-disabled") === "true" || settings.disabled) return
    if (node.hasAttribute("data-carousel-toggle")) { userPaused = !userPaused; schedule() }
    else command(node.hasAttribute("data-carousel-to") ? Number(node.dataset.carouselTo) : (target ?? index) + (node.hasAttribute("data-carousel-next") ? 1 : -1), "control")
  })
  render(); observers()
  if (!settings.disabled) command(Math.max(0, index), "api", true, true)
  else schedule()
  return {
    element, viewport, get slides() { return Object.freeze([...slides]) }, get connected() { return connected }, get state() { return state() },
    getCurrentIndex: () => index,
    to: value => command(value, "api"), prev: () => command((target ?? index) - 1, "api"), next: () => command((target ?? index) + 1, "api"),
    play() { live(); if (!settings.autoplay) throw new Error("Enable autoplay with a pause/play control first."); userPaused = false; schedule() },
    pause() { live(); userPaused = true; schedule() },
    set(input) {
      live(); const next = config(input)
      stopTimers()
      scroll(settings.direction === "vertical" ? viewport.scrollTop : viewport.scrollLeft, false)
      const desired = input.currentIndex ?? target ?? index
      settings = next; target = null; interacting = false
      render(); observers()
      if (!settings.disabled) command(clamp(desired), "api", true, true)
      else schedule()
    },
    reset() { command(clamp(settings.defaultIndex), "api", true, true) },
    refresh, disconnect,
  }
}
