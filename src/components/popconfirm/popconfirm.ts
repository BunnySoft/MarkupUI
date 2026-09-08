import { createPopover } from "../popover/popover.js"
import type { PopoverController, PopoverOptions } from "../popover/popover.js"
import { createActionState } from "./state.js"

export type PopconfirmAction = "positive" | "negative"
export type PopconfirmCallback = (event: MouseEvent) => unknown
export interface PopconfirmOptions extends Omit<PopoverOptions, "trigger" | "delay" | "duration"> {
  trigger?: "click" | "manual"
  onPositive?: PopconfirmCallback
  onNegative?: PopconfirmCallback
}
export interface PopconfirmError {
  action: PopconfirmAction | null
  error: unknown
  stale: boolean
}
export interface PopconfirmController extends PopoverController {
  readonly inline: boolean
  readonly pending: PopconfirmAction | null
  readonly lastAction: Promise<boolean> | null
}

export function createPopconfirm(trigger: HTMLElement, panel: HTMLElement, options: PopconfirmOptions = {}): PopconfirmController {
  const document = trigger?.ownerDocument
  const view = document?.defaultView
  if (!view || !(trigger instanceof view.HTMLButtonElement) || trigger.type !== "button"
    || !(panel instanceof view.HTMLElement) || panel.ownerDocument !== document
    || !["div", "section", "article", "aside", "span"].includes(panel.localName)) {
    throw new TypeError("Popconfirm needs a native type=button trigger and HTML panel in one document.")
  }
  if (!["click", "manual"].includes(options.trigger ?? "click") || "delay" in options || "duration" in options) {
    throw new TypeError("Popconfirm supports click/manual triggers, not hover/focus delays.")
  }
  for (const callback of [options.onPositive, options.onNegative]) {
    if (callback !== undefined && typeof callback !== "function") throw new TypeError("Popconfirm callbacks must be functions.")
  }
  const callbacks = { positive: options.onPositive, negative: options.onNegative }
  function owned(selector: string) {
    return [...panel.querySelectorAll<HTMLElement>(selector)].filter(node => node.closest(".mui-popconfirm") === panel)
  }
  function one(selector: string) {
    const nodes = owned(selector)
    if (nodes.length !== 1) throw new TypeError(`Popconfirm needs exactly one owned ${selector}.`)
    return nodes[0]!
  }
  const positive = one("[data-popconfirm-positive]")
  const negative = one("[data-popconfirm-negative]")
  const content = one("[data-popconfirm-content]")
  const errorRegion = one("[data-popconfirm-error]")
  const pendingRegion = one("[data-popconfirm-pending]")
  const completeRegion = one("[data-popconfirm-complete]")
  const panelId = panel.id
  let core: PopoverController | undefined
  let attached = false
  let epoch = 0
  let active: { action: PopconfirmAction; epoch: number; focused: boolean; button: HTMLElement } | null = null
  let lastAction: Promise<boolean> | null = null
  const queued = new Set<number>()
  const removers: (() => void)[] = []
  const state = createActionState(document!, () => {
    if (!trigger.isConnected || !panel.isConnected) controller.disconnect()
    else if (!available(trigger) || panel.closest("[hidden], [inert]")) controller.close()
  })
  const metadata = new view.MutationObserver(() => {
    if (!attached) return
    try { validate() } catch (error) { invalid(error) }
  })
  function textReference(value: string | null): boolean {
    const ids = value?.trim().split(/\s+/).filter(Boolean) ?? []
    return !!ids.length && ids.every(id => document!.getElementById(id)?.textContent?.trim())
  }
  function named(node: HTMLElement): boolean {
    const ids = node.getAttribute("aria-labelledby")
    return ids !== null ? textReference(ids) : !!(node.getAttribute("aria-label")?.trim() || node.textContent?.trim())
  }
  function validate() {
    if (panel.id !== panelId || !panel.classList.contains("mui-popconfirm") || panel.getAttribute("role") !== "dialog"
      || ![null, "false"].includes(panel.getAttribute("aria-modal")) || !named(panel)
      || !(panel.getAttribute("aria-label")?.trim() || textReference(panel.getAttribute("aria-labelledby")))
      || trigger.contains(panel)
      || (!core || core.supported) && panel.getAttribute("popover") !== "auto") {
      throw new TypeError("Popconfirm needs a separate named, nonmodal .mui-popconfirm[role=dialog][popover=auto].")
    }
    for (const [selector, node] of [
      ["[data-popconfirm-positive]", positive], ["[data-popconfirm-negative]", negative],
      ["[data-popconfirm-content]", content], ["[data-popconfirm-error]", errorRegion],
      ["[data-popconfirm-pending]", pendingRegion], ["[data-popconfirm-complete]", completeRegion],
    ] as const) if (one(selector) !== node) throw new TypeError("Popconfirm anatomy is immutable; disconnect and rebind.")
    if (new Set([positive, negative, content, errorRegion, pendingRegion, completeRegion]).size !== 6
      || positive.contains(negative) || negative.contains(positive)) throw new TypeError("Popconfirm needs separate, non-nested decision buttons and distinct regions.")
    if (!content.id || document!.getElementById(content.id) !== content || !content.textContent?.trim()
      || !panel.getAttribute("aria-describedby")?.split(/\s+/).includes(content.id)
      || !textReference(panel.getAttribute("aria-describedby"))) throw new TypeError("Popconfirm needs an explicitly referenced description.")
    for (const button of [positive, negative]) {
      if (!(button instanceof view!.HTMLButtonElement) || button.type !== "button" || !named(button)
        || ["popovertarget", "popovertargetaction", "command", "commandfor"].some(name => button.hasAttribute(name))) {
        throw new TypeError("Popconfirm decisions must be named type=button controls without native commands.")
      }
    }
    if ([errorRegion, pendingRegion, completeRegion].some(node => !node.textContent?.trim())
      || errorRegion.getAttribute("role") !== "alert" || pendingRegion.getAttribute("role") !== "status"
      || completeRegion.getAttribute("role") !== "status") throw new TypeError("Author nonempty error alert and pending/completion status regions.")
  }
  function emit(detail: PopconfirmError) {
    panel.dispatchEvent(new view!.CustomEvent<PopconfirmError>("mui:popconfirm-error", { detail }))
  }
  function invalidate() {
    epoch++
    active = null
    for (const timer of queued) view!.clearTimeout(timer)
    queued.clear()
    state.restore()
  }
  function invalid(error: unknown) {
    controller.disconnect()
    emit({ action: null, error, stale: false })
  }
  function listen(target: EventTarget, name: string, listener: EventListener) {
    target.addEventListener(name, listener)
    removers.push(() => target.removeEventListener(name, listener))
  }
  function available(button: HTMLElement) {
    return button.isConnected && !button.matches(":disabled") && !button.closest("[hidden], [inert]")
  }
  function live() {
    return !!core?.connected && !core.disabled && available(trigger) && panel.isConnected
      && !panel.closest("[hidden], [inert]") && (core.supported ? core.show : true)
  }
  function focusIfSafe(target: HTMLElement) {
    if (document!.hasFocus() && available(target) && target.getBoundingClientRect().width > 0
      && !["hidden", "collapse"].includes(view!.getComputedStyle(target).visibility)) target.focus({ preventScroll: true })
  }
  function start(action: PopconfirmAction, button: HTMLElement, event: MouseEvent) {
    if (active || !live() || !available(button)) return
    try { validate() } catch (error) { invalid(error); return }
    const operation = { action, epoch, button, focused: panel.contains(document!.activeElement) }
    active = operation
    state.restore()
    state.set(panel, "data-popconfirm-state", "pending")
    state.set(panel, "aria-busy", "true", "pending")
    for (const target of [positive, negative]) {
      if (!target.hasAttribute("disabled")) state.set(target, "disabled", "", "pending")
    }
    state.set(pendingRegion, "hidden", null, "pending")
    const task = new Promise<unknown>(resolve => resolve(callbacks[action]?.(event))).then(value => value !== false)
    lastAction = task
    const current = () => active === operation && epoch === operation.epoch && live()
    function finish() {
      const restoreFocus = panel.contains(document!.activeElement)
        || operation.focused && document!.activeElement === document!.body
      state.restore("pending")
      active = null
      return restoreFocus
    }
    void task.then(accepted => {
      if (!current()) return
      const focus = finish()
      if (accepted && core!.supported) {
        core!.close()
        if (focus && (document!.activeElement === document!.body || panel.contains(document!.activeElement))) focusIfSafe(trigger)
      } else {
        state.set(panel, "data-popconfirm-state", accepted ? "complete" : "idle")
        if (accepted) state.set(completeRegion, "hidden", null)
        if (focus) focusIfSafe(available(button) ? button : negative)
        core!.syncPosition()
      }
    }, error => {
      const stale = !current()
      if (!stale) {
        const focus = finish()
        state.set(panel, "data-popconfirm-state", "error")
        state.set(errorRegion, "hidden", null)
        if (focus) focusIfSafe(available(button) ? button : negative)
        core!.syncPosition()
      }
      emit({ action, error, stale })
    })
  }
  function decision(action: PopconfirmAction, button: HTMLElement): EventListener {
    return event => {
      if (active || queued.size) return
      const clickedEpoch = epoch
      // Native event dispatch may checkpoint microtasks between listeners; wait for a task.
      const timer = view!.setTimeout(() => {
        queued.delete(timer)
        if (!trigger.isConnected || !panel.isConnected) controller.disconnect()
        else if (attached && clickedEpoch === epoch && !event.defaultPrevented) start(action, button, event as MouseEvent)
      }, 0)
      queued.add(timer)
    }
  }
  function attach() {
    if (attached) return
    attached = true
    listen(positive, "click", decision("positive", positive))
    listen(negative, "click", decision("negative", negative))
    listen(panel, "beforetoggle", event => {
      if (event.target !== panel) return
      invalidate()
      if ((event as ToggleEvent).newState === "open") {
        try { validate() } catch (error) { event.preventDefault(); invalid(error) }
      }
    })
    metadata.observe(panel, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: ["role", "aria-label", "aria-labelledby", "aria-describedby", "aria-modal", "type", "popover", "id",
        "popovertarget", "popovertargetaction", "command", "commandfor", "class", "data-popconfirm-positive",
        "data-popconfirm-negative", "data-popconfirm-content", "data-popconfirm-error", "data-popconfirm-pending",
        "data-popconfirm-complete"],
    })
  }
  function detach() {
    attached = false
    invalidate()
    metadata.disconnect()
    for (const remove of removers.splice(0)) remove()
  }
  const controller: PopconfirmController = {
    get supported() { return core?.supported ?? false },
    get inline() { return core?.supported === false },
    get connected() { return core?.connected ?? false },
    get show() { return core?.show ?? false },
    get pending() { return active?.action ?? null },
    get lastAction() { return lastAction },
    get disabled() { return core?.disabled ?? false },
    set disabled(value) {
      if (typeof value !== "boolean") throw new TypeError("disabled must be boolean.")
      if (value) invalidate()
      if (core) core.disabled = value
    },
    open() {
      if (!core?.connected) return false
      validate()
      return core.open()
    },
    close() { invalidate(); core?.close() },
    setShow(show) {
      if (typeof show !== "boolean") throw new TypeError("setShow requires a boolean.")
      if (show) return controller.open()
      controller.close()
      return false
    },
    syncPosition: () => core?.syncPosition() ?? false,
    connect() {
      if (core?.connected) return
      validate()
      core!.connect()
      attach()
    },
    disconnect() { core?.disconnect() },
  }
  validate()
  if ([errorRegion, pendingRegion, completeRegion].some(node => !node.hidden)) {
    throw new TypeError("Popconfirm status/error regions must initially be hidden.")
  }
  core = createPopover(trigger, panel, options)
  // Shared automatic removal/invalid-anatomy cleanup uses this same explicit lifecycle method.
  const disconnect = core.disconnect
  core.disconnect = () => { detach(); disconnect() }
  attach()
  return controller
}
