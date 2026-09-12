import { createPopoverPositioner, ownedWrites } from "./position.js"
import type { PlacementOptions, PopoverPlacement } from "./position.js"

export interface PopoverOptions {
  trigger?: "click" | "hover" | "focus" | "manual"
  placement?: PopoverPlacement
  delay?: number
  duration?: number
  gap?: number
  margin?: number
  flip?: boolean
  disabled?: boolean
  positioning?: "auto" | "fallback"
}

export interface PopoverController {
  readonly supported: boolean
  readonly connected: boolean
  readonly show: boolean
  disabled: boolean
  open(): boolean
  close(): void
  setShow(show: boolean): boolean
  syncPosition(): boolean
  connect(): void
  disconnect(): void
}

const owners = new WeakMap<HTMLElement, PopoverController>()

export function createPopover(trigger: HTMLElement, panel: HTMLElement, options: PopoverOptions = {}): PopoverController {
  return createPopoverController(trigger, panel, options)
}

/** Internal description semantics used by Tooltip, not a public Popover option. */
export interface PopoverSemantics {
  validate(): void
  connect(): () => void
  attributes: string[]
  errorEvent: string
}

export function createPopoverController(
  trigger: HTMLElement,
  panel: HTMLElement,
  options: PopoverOptions,
  semantics?: PopoverSemantics,
): PopoverController {
  const document = trigger?.ownerDocument
  const view = document?.defaultView
  if (!view || !(trigger instanceof view.HTMLElement) || !(panel instanceof view.HTMLElement)
    || panel.ownerDocument !== document || panel === trigger || panel.contains(trigger)) {
    throw new TypeError("Use separate HTML trigger/panel nodes in one document.")
  }
  const mode = options.trigger ?? "click"
  const panelId = panel.id
  const placement = options.placement ?? "bottom"
  if (!["click", "hover", "focus", "manual"].includes(mode)
    || !/^(top|bottom|left|right)(-start|-end)?$/.test(placement)
    || !["auto", "fallback"].includes(options.positioning ?? "auto")) throw new TypeError("Invalid mode or placement.")
  for (const value of [options.delay, options.duration, options.gap, options.margin]) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > 60_000)) {
      throw new RangeError("Timing/geometry must be finite in 0..60000.")
    }
  }
  for (const value of [options.flip, options.disabled]) {
    if (value !== undefined && typeof value !== "boolean") throw new TypeError("flags must be boolean.")
  }
  const geometry: PlacementOptions = {
    placement, gap: options.gap ?? 8, margin: options.margin ?? 8,
    flip: options.flip ?? true, positioning: options.positioning ?? "auto",
  }
  const positioner = createPopoverPositioner(trigger, panel, geometry)
  const delay = options.delay ?? 100
  const duration = options.duration ?? 100
  const aria = ownedWrites()
  const openingPaint = ownedWrites()
  const supported = typeof panel.showPopover === "function" && typeof panel.hidePopover === "function"
  let connected = false
  let disabled = options.disabled ?? false
  let timer = 0, frame = 0, generation = 0
  let active = false
  let openingEvent: Event | undefined
  let openingHadStyle = true
  let observer: MutationObserver | undefined
  let resize: ResizeObserver | undefined
  let cleanup: (() => void) | undefined
  const bindings: (() => void)[] = []
  const activeBindings: (() => void)[] = []
  const pointers = new Set<EventTarget>()
  const isOpen = () => supported && panel.matches(":popover-open")
  const unavailable = () => disabled || !trigger.isConnected || !panel.isConnected
    || !!trigger.closest("[hidden], [inert]") || !!panel.closest("[hidden], [inert]")
    || trigger.matches(":disabled")
  function listen(target: EventTarget, name: string, fn: EventListener, list = bindings, capture = false) {
    target.addEventListener(name, fn, capture)
    list.push(() => target.removeEventListener(name, fn, capture))
  }
  function clearTimer() {
    view!.clearTimeout(timer)
    timer = 0
  }
  function stopActive() {
    clearTimer()
    if (openingEvent?.eventPhase) openingEvent.preventDefault()
    openingEvent = undefined
    view!.cancelAnimationFrame(frame)
    frame = 0
    resize?.disconnect()
    resize = undefined
    observer?.disconnect()
    observer = undefined
    for (const remove of activeBindings.splice(0)) remove()
    positioner.clear()
    openingPaint.restore()
    // Positioning writes can inherit the style attribute created by the paint guard.
    if (!openingHadStyle && panel.getAttribute("style") === "") panel.removeAttribute("style")
    openingHadStyle = true
    pointers.clear()
    active = false
  }
  function observeLifecycle() {
    if (observer) return
    for (let parent = trigger.parentElement; parent; parent = parent.parentElement) {
      if (!parent.hasAttribute("popover")) continue
      const ancestor = parent
      listen(ancestor, "toggle", () => {
        if (!ancestor.matches(":popover-open")) controller.close()
      }, activeBindings)
    }
    observer = new view!.MutationObserver(() => {
      if (!trigger.isConnected || !panel.isConnected) controller.disconnect()
      else if (unavailable()) controller.close()
      else {
        try { validate() } catch (error) {
          controller.disconnect()
          panel.dispatchEvent(new view!.CustomEvent(semantics?.errorEvent ?? "m:popover-error", { detail: { error } }))
          return
        }
        if (isOpen()) schedulePosition()
      }
    })
    observer.observe(document!, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: ["hidden", "inert", "disabled", "popover", "id", "popovertarget", ...semantics?.attributes ?? []],
    })
  }
  function startActive() {
    if (active) return
    active = true
    observeLifecycle()
    listen(document!, "scroll", schedulePosition, activeBindings, true)
    listen(view!, "resize", schedulePosition, activeBindings)
    if (view!.visualViewport) {
      listen(view!.visualViewport, "resize", schedulePosition, activeBindings)
      listen(view!.visualViewport, "scroll", schedulePosition, activeBindings)
    }
    if (view!.ResizeObserver) {
      resize = new view!.ResizeObserver(schedulePosition)
      resize.observe(trigger)
      resize.observe(panel)
      for (let parent = trigger.parentElement; parent; parent = parent.parentElement) resize.observe(parent)
    }
  }
  function schedulePosition() {
    const current = generation
    if (!frame) frame = view!.requestAnimationFrame(() => {
      frame = 0
      if (current === generation) reconcile()
    })
  }
  function reconcile() {
    if (!connected || !supported) return
    if (isOpen() && !unavailable()) {
      if (!semantics) aria.attr(trigger, "aria-expanded", "true")
      startActive()
      controller.syncPosition()
    } else {
      if (isOpen()) panel.hidePopover()
      stopActive()
      if (!semantics) aria.attr(trigger, "aria-expanded", "false")
    }
  }
  function within(target: EventTarget | null) {
    return target instanceof view!.Node && (trigger.contains(target) || panel.contains(target))
  }
  function focused() {
    return within(document!.activeElement)
  }
  function request(show: boolean, delay: number) {
    clearTimer()
    if (!show && !isOpen()) {
      stopActive()
      return
    }
    if (show && (unavailable() || isOpen())) return
    observeLifecycle()
    if (!delay) {
      if (show) controller.open()
      else controller.close()
    } else {
      timer = view!.setTimeout(() => {
        timer = 0
        if (show) controller.open()
        else controller.close()
      }, delay)
    }
  }
  const enter: EventListener = event => {
    if ((event as PointerEvent).pointerType === "touch") return
    if (event.currentTarget) pointers.add(event.currentTarget)
    request(true, delay)
  }
  const leave: EventListener = event => {
    if ((event as PointerEvent).pointerType === "touch") return
    if (event.currentTarget) pointers.delete(event.currentTarget)
    if (within((event as PointerEvent).relatedTarget) || focused()) return
    request(false, duration)
  }
  const focusIn: EventListener = () => request(true, 0)
  const focusOut: EventListener = event => {
    if (!within((event as FocusEvent).relatedTarget) && (mode !== "hover" || !pointers.size)) request(false, duration)
  }
  function validate() {
    semantics?.validate()
    if (!trigger.isConnected || !panel.isConnected || trigger.getRootNode() !== document || panel.getRootNode() !== document
      || !panel.id || panel.id !== panelId || /\s/.test(panel.id) || document!.getElementById(panel.id) !== panel
      || [...document!.querySelectorAll("[id]")].filter(node => node.id === panel.id).length !== 1
      || !panel.classList.contains("m-popover") || !["auto", "manual"].includes(panel.getAttribute("popover") ?? "")
      || panel.hasAttribute("hidden")) throw new TypeError("Use connected light-DOM, a unique ID, .m-popover, popover=auto|manual and no hidden.")
    if (trigger.closest("m-popover") || panel.closest("m-popover")) throw new TypeError("No legacy m-popover nesting.")
    const parentPopover = trigger.parentElement?.closest("[popover]")
    if (parentPopover && !parentPopover.contains(panel)) throw new TypeError("No portalled nesting.")
    if (mode === "click") {
      if (!(trigger instanceof view!.HTMLButtonElement) || trigger.type !== "button"
        || trigger.getAttribute("popovertarget") !== panel.id
        || !["", "toggle"].includes(trigger.getAttribute("popovertargetaction") ?? "")) {
        throw new TypeError("Use type=button with a matching popovertarget toggle.")
      }
    } else {
      if (trigger.hasAttribute("popovertarget")) throw new TypeError("Only click mode supports popovertarget.")
      if (mode !== "manual" && !trigger.matches("button, input:not([type=hidden]), select, textarea, a[href]")) {
        throw new TypeError("Use a native focusable trigger.")
      }
    }
  }
  const controller: PopoverController = {
    supported,
    get connected() { return connected },
    get show() { return isOpen() },
    get disabled() { return disabled },
    set disabled(value) {
      if (typeof value !== "boolean") throw new TypeError("disabled must be boolean.")
      disabled = value
      if (value) controller.close()
    },
    open() {
      if (!connected || !supported || unavailable()) return false
      validate()
      clearTimer()
      // Descriptions must not acquire invoker/expanded or focus-navigation semantics.
      if (semantics) panel.showPopover()
      else (panel.showPopover as (options: { source: HTMLElement }) => void)({ source: trigger })
      reconcile()
      return isOpen()
    },
    close() {
      clearTimer()
      if (isOpen()) panel.hidePopover()
      if (connected) reconcile()
      else stopActive()
    },
    setShow(show) {
      if (typeof show !== "boolean") throw new TypeError("show must be boolean.")
      if (show) return controller.open()
      controller.close()
      return false
    },
    syncPosition() {
      if (!connected || !isOpen()) return false
      if (unavailable() || !positioner.update()) {
        controller.close()
        return false
      }
      openingEvent = undefined
      openingPaint.restore()
      return true
    },
    connect() {
      if (connected) return
      validate()
      if (owners.has(trigger) || owners.has(panel)) throw new Error("Node has an active controller.")
      if (isOpen()) throw new Error("Connect while closed.")
      owners.set(trigger, controller)
      owners.set(panel, controller)
      connected = true
      generation++
      cleanup = semantics?.connect()
      if (!supported) {
        aria.attr(panel, "popover", null)
        return
      }
      if (!semantics) {
        const controls = trigger.getAttribute("aria-controls")?.split(/\s+/).filter(Boolean) ?? []
        if (!controls.includes(panel.id)) aria.attr(trigger, "aria-controls", [...controls, panel.id].join(" "))
        aria.attr(trigger, "aria-expanded", "false")
      }
      listen(panel, "beforetoggle", event => {
        if (event.target !== panel) return
        const opening = (event as ToggleEvent).newState === "open"
        if (opening && unavailable()) event.preventDefault()
        if (opening && !event.defaultPrevented) {
          openingEvent = event
          openingHadStyle = panel.hasAttribute("style")
          // Keep native autofocus available while suppressing unpositioned paint.
          openingPaint.style(panel, "animation-name", "none")
          openingPaint.style(panel, "opacity", "0")
          openingPaint.style(panel, "pointer-events", "none")
          observeLifecycle()
        } else if (!opening) {
          stopActive()
        }
        schedulePosition()
      })
      listen(panel, "toggle", event => { if (event.target === panel) reconcile() })
      if (mode === "hover" || mode === "focus") {
        for (const node of [trigger, panel]) {
          listen(node, "focusin", focusIn)
          listen(node, "focusout", focusOut)
          if (mode === "hover") {
            listen(node, "pointerenter", enter)
            listen(node, "pointerleave", leave)
          }
        }
      }
    },
    disconnect() {
      if (!connected) return
      connected = false
      generation++
      for (const remove of bindings.splice(0)) remove()
      if (isOpen()) panel.hidePopover()
      stopActive()
      aria.restore()
      owners.delete(trigger)
      owners.delete(panel)
      cleanup?.()
      cleanup = undefined
    },
  }
  controller.connect()
  return controller
}
