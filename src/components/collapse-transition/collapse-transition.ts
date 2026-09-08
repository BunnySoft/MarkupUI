import { createFeedbackAttributes } from "../feedback/attributes.js"
import { observeFeedbackRoot } from "../feedback/lifetime.js"

export type CollapseTransitionState = "open" | "closed" | "opening" | "closing"
export interface CollapseTransitionHookEvent {
  element: HTMLElement
  show: boolean
  controller: CollapseTransitionController
}
export type CollapseTransitionHook = (event: CollapseTransitionHookEvent) => void
export interface CollapseTransitionOptions {
  show?: boolean
  appear?: boolean
  duration?: number
  focusTarget?: HTMLElement
  onEnter?: CollapseTransitionHook
  onLeave?: CollapseTransitionHook
  onAfterEnter?: CollapseTransitionHook
  onAfterLeave?: CollapseTransitionHook
  onCancel?: CollapseTransitionHook
}
export interface CollapseTransitionError {
  error: unknown
  phase: "animation" | "hook" | "ownership"
  stale: boolean
}
export interface CollapseTransitionController {
  readonly element: HTMLElement
  readonly connected: boolean
  readonly show: boolean
  readonly state: CollapseTransitionState
  readonly animation: Animation | null
  readonly finished: Promise<boolean>
  readonly lastError: unknown
  setShow(show: boolean): Promise<boolean>
  finish(): Promise<boolean>
  cancel(): void
  dispose(): void
}
interface Operation {
  token: number
  show: boolean
  from: number
  animation: Animation | null
  expectedCancel: boolean
  forceFinish: boolean
  started: boolean
  hookStarted: boolean
  appear: boolean
  promise: Promise<boolean>
  resolve(value: boolean): void
  reject(error: unknown): void
}
const ownerKey = Symbol.for("markupui.collapse-transition.owner")

export function createCollapseTransition(element: HTMLElement, options: CollapseTransitionOptions = {}): CollapseTransitionController {
  const document = element?.ownerDocument
  const view = document?.defaultView
  if (!view || !(element instanceof view.HTMLDivElement) || element.getRootNode() !== document
    || !element.classList.contains("mui-collapse-transition")) throw new TypeError("Use a connected light-DOM div.mui-collapse-transition.")
  if (!options || typeof options !== "object" || Object.keys(options).some(key => !["show", "appear", "duration", "focusTarget", "onEnter", "onLeave", "onAfterEnter", "onAfterLeave", "onCancel"].includes(key))) {
    throw new TypeError("Unsupported transition options; no renderer, directive or style-object forwarding.")
  }
  for (const value of [options.show, options.appear]) if (value !== undefined && typeof value !== "boolean") throw new TypeError("show and appear must be boolean.")
  const duration = options.duration === undefined ? 300 : options.duration
  if (!Number.isInteger(duration) || duration < 0 || duration > 10_000) throw new RangeError("Duration must be an integer from 0 to 10000 ms.")
  const hooks = { onEnter: options.onEnter, onLeave: options.onLeave, onAfterEnter: options.onAfterEnter, onAfterLeave: options.onAfterLeave, onCancel: options.onCancel }
  for (const hook of Object.values(hooks)) if (hook !== undefined && typeof hook !== "function") throw new TypeError("Transition hooks must be functions.")
  const focusTarget = options.focusTarget
  if (focusTarget !== undefined && (!(focusTarget instanceof view.HTMLElement) || focusTarget.ownerDocument !== document || element.contains(focusTarget))) {
    throw new TypeError("Use an explicit same-document focus target outside the transition wrapper.")
  }
  const owned = element as HTMLElement & { [ownerKey]?: object }
  if (owned[ownerKey]) throw new Error("This transition wrapper already has an owner.")
  const token = {}
  const inner = element.querySelector<HTMLElement>(":scope > [data-collapse-transition-content]")
  const originalHidden = element.hasAttribute("hidden")
  let connected = true
  let disposing = false
  let generation = 0
  let desired = options.show ?? !originalHidden
  let active: Operation | null = null
  let lastPromise = Promise.resolve(true)
  let lastError: unknown = null
  const hidden = createFeedbackAttributes(document)
  const motion = createFeedbackAttributes(document)
  const reduced = view.matchMedia?.("(prefers-reduced-motion: reduce)")
  const print = view.matchMedia?.("print")
  let stopObserving = () => {}
  const metadata = new view.MutationObserver(() => {
    if (!connected) return
    if (element.getRootNode() !== document) { dispose(true); return }
    if (active?.animation && (element.hidden || !element.hasAttribute("inert")
      || !element.hasAttribute("data-collapse-transition-active") || !clipped())) {
      fail(active, new Error("Author visibility/inert/clipping changes interrupted the animation."), "ownership")
    }
  })

  function structure() {
    if (!inner || !(inner instanceof view!.HTMLDivElement) || inner.parentElement !== element
      || element.children.length !== 1 || element.querySelector(":scope > [data-collapse-transition-content]") !== inner) {
      throw new TypeError("Author one direct native div[data-collapse-transition-content]; keep its identity stable.")
    }
  }
  function number(value: string) { return Number.parseFloat(value) || 0 }
  function clipped() { return ["hidden", "clip"].includes(view!.getComputedStyle(element).overflowY) }
  function layout() {
    structure()
    const outer = view!.getComputedStyle(element)
    const content = view!.getComputedStyle(inner!)
    if (!["block", "flow-root", "none", ""].includes(outer.display)
      || number(outer.paddingTop) || number(outer.paddingBottom) || number(outer.borderTopWidth) || number(outer.borderBottomWidth)
      || number(outer.marginTop) || number(outer.marginBottom)
      || number(outer.minHeight) || !["none", ""].includes(outer.maxHeight)
      || !["none", ""].includes(outer.transform) || !["horizontal-tb", ""].includes(outer.writingMode)
      || element.style.height && element.style.height !== "auto"
      || number(content.marginTop) || number(content.marginBottom)) {
      throw new TypeError("Use an unstyled natural-height block wrapper; put padding/borders/content presentation on its flow-root inner div.")
    }
  }
  function current(operation: Operation) { return connected && active === operation && generation === operation.token }
  function error(error: unknown, phase: CollapseTransitionError["phase"], stale: boolean) {
    lastError = error
    const event = new view!.CustomEvent<CollapseTransitionError>("mui:collapse-transition-error", { detail: { error, phase, stale }, cancelable: true })
    if (element.dispatchEvent(event)) view!.console.error("MarkupUI Collapse Transition:", error)
  }
  function hook(name: keyof typeof hooks, operation: Operation) {
    const result: unknown = hooks[name]?.({ element, show: operation.show, controller })
    void Promise.resolve(result).catch(reason => error(reason, "hook", generation !== operation.token || active !== operation))
  }
  function available(target: HTMLElement) {
    return target.isConnected && !target.matches(":disabled") && !target.closest("[hidden], [inert]")
  }
  function evacuate() {
    if (!element.contains(document.activeElement)) return
    if (!focusTarget || !available(focusTarget)) throw new Error("Move focus outside before hiding, or supply an available focusTarget.")
    focusTarget.focus({ preventScroll: true })
    if (element.contains(document.activeElement)) throw new Error("The focus target could not receive focus; content was not hidden.")
  }
  function height(): number {
    if (element.hidden) return 0
    const value = Number.parseFloat(view!.getComputedStyle(element).height)
    return Number.isFinite(value) ? Math.max(0, value) : element.offsetHeight
  }
  function stopAnimation(operation: Operation) {
    const animation = operation.animation
    operation.animation = null
    operation.expectedCancel = true
    animation?.cancel()
  }
  function fail(operation: Operation, reason: unknown, phase: CollapseTransitionError["phase"]) {
    if (!current(operation)) { error(reason, phase, true); return }
    active = null
    const failedGeneration = ++generation
    try { stopAnimation(operation) } catch (cancelError) { error(cancelError, "animation", true) }
    motion.restore()
    if (generation === failedGeneration) desired = !element.hidden
    operation.reject(reason)
    error(reason, phase, false)
  }
  function settle(operation: Operation, cancelled = false) {
    if (!current(operation)) return
    try {
      if (!operation.show) evacuate()
      if (!current(operation)) return
      hidden.set(element, "hidden", operation.show ? null : "")
      if (!current(operation)) return
      if (element.hidden === operation.show) throw new Error("An author hidden override prevents the requested visibility; dispose and rebind.")
      stopAnimation(operation)
      if (!current(operation)) return
      motion.restore()
      if (!current(operation)) return
      active = null
      desired = operation.show
      try { hook(cancelled ? "onCancel" : operation.show ? "onAfterEnter" : "onAfterLeave", operation) }
      catch (reason) { operation.reject(reason); error(reason, "hook", generation !== operation.token); return }
      operation.resolve(!cancelled)
    } catch (reason) { fail(operation, reason, "ownership") }
  }
  function expectedAbort(reason: unknown) { return reason instanceof view!.DOMException && reason.name === "AbortError" }
  function run(operation: Operation, appear = false) {
    if (!current(operation)) return
    operation.started = true
    try {
      layout()
      if (!operation.show) evacuate()
      if (!current(operation)) return
      let animate = !operation.forceFinish && duration > 0 && typeof element.animate === "function"
        && "inert" in view!.HTMLElement.prototype && !!reduced && !reduced.matches && !print?.matches
        && !(appear && element.contains(document.activeElement))
      if (animate) {
        motion.set(element, "inert", "")
        if (!current(operation)) return
        motion.set(element, "data-collapse-transition-active", "")
        if (!current(operation)) return
        animate = clipped() && element.hasAttribute("inert")
      }
      if (operation.show) hidden.set(element, "hidden", null)
      if (!current(operation)) return
      operation.hookStarted = true
      try { hook(operation.show ? "onEnter" : "onLeave", operation) }
      catch (reason) { fail(operation, reason, "hook"); return }
      if (!current(operation)) return
      if (animate && (!element.hasAttribute("data-collapse-transition-active") || !element.hasAttribute("inert") || !clipped())) {
        throw new Error("A start hook interrupted native clipping/inert ownership.")
      }
      if (!operation.show) evacuate()
      if (!current(operation)) return
      const target = operation.show ? inner!.offsetHeight : 0
      if (!Number.isFinite(operation.from) || !Number.isFinite(target) || operation.from < 0 || target < 0) throw new RangeError("Transition geometry must be finite and nonnegative.")
      if (!animate || operation.forceFinish || Math.abs(operation.from - target) < .5) { settle(operation); return }
      const animation = element.animate([{ height: `${operation.from}px` }, { height: `${target}px` }], { duration, easing: "ease-in-out", fill: "both" })
      operation.animation = animation
      void animation.finished.then(() => settle(operation), reason => {
        if (expectedAbort(reason) && operation.expectedCancel) return
        if (current(operation) && expectedAbort(reason) && animation.playState === "idle") { settle(operation, true); return }
        fail(operation, reason, "animation")
      })
    } catch (reason) { fail(operation, reason, "animation") }
  }
  function request(show: boolean, appear = false) {
    if (typeof show !== "boolean") throw new TypeError("setShow requires a boolean.")
    if (!connected || disposing) throw new Error("Transition owner is disposed.")
    if (element.getRootNode() !== document) { dispose(true); throw new Error("Transition wrapper was removed.") }
    structure()
    if (!appear && desired === show && (active || element.hidden !== show)) return active?.promise ?? Promise.resolve(true)
    const from = appear ? 0 : height()
    const previous = active
    const operation = { token: ++generation, show, from, animation: null, expectedCancel: false, forceFinish: false, started: false, hookStarted: false, appear } as Operation
    operation.promise = new Promise<boolean>((resolve, reject) => { operation.resolve = resolve; operation.reject = reject })
    void operation.promise.catch(() => {})
    active = operation
    desired = show
    lastPromise = operation.promise
    lastError = null
    if (previous) {
      try { stopAnimation(previous) } catch (reason) { error(reason, "animation", true) }
      previous.resolve(false)
      try { hook("onCancel", previous) } catch (reason) { error(reason, "hook", true) }
    }
    if (appear) view!.queueMicrotask(() => run(operation, true))
    else run(operation)
    return operation.promise
  }
  function dispose(automatic = false) {
    if (!connected || disposing) return
    disposing = true
    try { if (!automatic && originalHidden && !element.hidden) evacuate() }
    catch (reason) { disposing = false; throw reason }
    generation++
    const previous = active
    active = null
    connected = false
    stopObserving(); metadata.disconnect()
    reduced?.removeEventListener("change", mediaChanged)
    print?.removeEventListener("change", mediaChanged)
    view!.removeEventListener("beforeprint", beforePrint)
    if (previous) {
      try { stopAnimation(previous) } catch (reason) { error(reason, "animation", true) }
      previous.resolve(false)
    }
    motion.restore()
    hidden.restore()
    desired = !element.hidden
    if (owned[ownerKey] === token) delete owned[ownerKey]
  }
  function mediaChanged() { if (active && (reduced?.matches || print?.matches)) void controller.finish() }
  function beforePrint() { if (active) void controller.finish() }
  const controller: CollapseTransitionController = {
    element,
    get connected() { if (connected && element.getRootNode() !== document) dispose(true); return connected },
    get show() { return desired },
    get state() { return active ? active.show ? "opening" : "closing" : element.hidden ? "closed" : "open" },
    get animation() { return active?.animation ?? null },
    get finished() { return lastPromise },
    get lastError() { return lastError },
    setShow: show => request(show),
    finish() {
      const operation = active
      if (!operation) return lastPromise
      operation.forceFinish = true
      if (!operation.started) { run(operation, operation.appear); return operation.promise }
      if (!operation.hookStarted) return operation.promise
      try { operation.animation?.finish(); settle(operation) }
      catch (reason) { fail(operation, reason, "animation") }
      return operation.promise
    },
    cancel() { if (active) settle(active, true) },
    dispose: () => dispose(),
  }
  owned[ownerKey] = token
  try {
    layout()
    if (!desired) evacuate()
    hidden.set(element, "hidden", desired ? null : "")
    metadata.observe(element, { attributes: true, attributeFilter: ["hidden", "inert", "data-collapse-transition-active", "class", "style"] })
    stopObserving = observeFeedbackRoot(element, () => {
      if (!connected) return
      if (element.getRootNode() !== document) { dispose(true); return }
      try { structure() } catch (reason) {
        if (active) fail(active, reason, "ownership")
        else error(reason, "ownership", false)
      }
    })
    reduced?.addEventListener("change", mediaChanged)
    print?.addEventListener("change", mediaChanged)
    view.addEventListener("beforeprint", beforePrint)
    if (options.appear && desired) request(true, true)
  } catch (reason) { dispose(true); throw reason }
  return controller
}
