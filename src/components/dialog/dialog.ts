import { ownedAttributes } from "./attributes.js"
import { createNativeDialog } from "./native.js"
import type { NativeDialogController, NativeDialogOptions } from "./native.js"

export type DialogAction = "positive" | "negative" | "close"
export type DialogCallback = (event: MouseEvent) => unknown | Promise<unknown>
export interface DialogOptions extends NativeDialogOptions {
  onPositiveClick?: DialogCallback
  onNegativeClick?: DialogCallback
  onClose?: () => unknown | Promise<unknown>
}
export interface DialogError { action: DialogAction | null; error: unknown; stale: boolean }
export interface DialogController extends NativeDialogController {
  readonly pending: DialogAction | null
  readonly lastAction: Promise<boolean> | null
}

export function createDialog(dialog: HTMLDialogElement, options: DialogOptions = {}): DialogController {
  const view = dialog.ownerDocument.defaultView!
  const callbacks = { positive: options.onPositiveClick, negative: options.onNegativeClick, close: options.onClose }
  for (const callback of Object.values(callbacks)) {
    if (callback !== undefined && typeof callback !== "function") throw new TypeError("Dialog callbacks must be functions.")
  }
  const buttons = [...dialog.querySelectorAll<HTMLButtonElement>("[data-dialog-action]")]
    .filter(button => button.closest("dialog") === dialog)
  const actions = ["positive", "negative", "close"]
  function validateButtons() {
    const current = [...dialog.querySelectorAll("[data-dialog-action]")].filter(node => node.closest("dialog") === dialog)
    if (current.length !== buttons.length || current.some(node => !buttons.includes(node as HTMLButtonElement))) {
      throw new TypeError("Decision anatomy changed; dispose and bind the new controls.")
    }
    for (const button of buttons) {
      if (!(button instanceof view.HTMLButtonElement) || button.type !== "button"
        || !actions.includes(button.dataset.dialogAction ?? "")
        || !button.isConnected || button.closest("dialog") !== dialog
        || !(button.textContent?.trim() || button.getAttribute("aria-label")?.trim())
        || ["command", "commandfor", "popovertarget", "popovertargetaction"].some(name => button.hasAttribute(name))) {
        throw new TypeError("Decision markers require named type=button controls without native commands. Keep native submit controls unmarked.")
      }
    }
    if (new Set(buttons.map(button => button.dataset.dialogAction)).size !== buttons.length) {
      throw new TypeError("Use at most one button for each Dialog action.")
    }
  }
  const region = (selector: string) => [...dialog.querySelectorAll<HTMLElement>(selector)]
    .filter(node => node.closest("dialog") === dialog)
  const errors = region("[data-dialog-error]")
  const pendings = region("[data-dialog-pending]")
  const errorRegion = errors[0]
  const pendingRegion = pendings[0]
  if (buttons.length && (errors.length !== 1 || pendings.length !== 1 || !errorRegion?.hidden || !pendingRegion?.hidden
    || !errorRegion.textContent?.trim() || !pendingRegion.textContent?.trim()
    || errorRegion.getAttribute("role") !== "alert" || pendingRegion.getAttribute("role") !== "status"
    || errorRegion.contains(pendingRegion) || pendingRegion.contains(errorRegion)
    || buttons.some(button => button.contains(errorRegion) || button.contains(pendingRegion)
      || errorRegion.contains(button) || pendingRegion.contains(button)))) {
    throw new TypeError("Decisions need separate hidden, nonempty data-dialog-error alert and data-dialog-pending status regions.")
  }
  validateButtons()
  const native = createNativeDialog(dialog, options)
  const state = ownedAttributes(dialog.ownerDocument)
  let disposed = false
  let queued: number | null = null
  let active: { action: DialogAction; generation: number } | null = null
  let lastAction: Promise<boolean> | null = null
  const metadata = new view.MutationObserver(() => {
    if (disposed || !native.connected) return
    try {
      validateButtons()
      if (buttons.length && (region("[data-dialog-error]")[0] !== errorRegion
        || region("[data-dialog-pending]")[0] !== pendingRegion
        || !errorRegion?.textContent?.trim() || !pendingRegion?.textContent?.trim()
        || errorRegion.getAttribute("role") !== "alert" || pendingRegion.getAttribute("role") !== "status")) {
        throw new TypeError("Decision status anatomy changed; dispose and rebind.")
      }
    } catch (error) {
      const action = active?.action ?? null
      controller.dispose()
      dialog.dispatchEvent(new view.CustomEvent<DialogError>("mui:dialog-error", { detail: { action, error, stale: false } }))
    }
  })
  function invalidate() {
    if (queued !== null) view.clearTimeout(queued)
    queued = null
    active = null
    state.restore()
  }
  function available(button: HTMLButtonElement) {
    return button.isConnected && !button.matches(":disabled") && !button.closest("[hidden], [inert]")
  }
  function start(button: HTMLButtonElement, event: MouseEvent) {
    if (disposed || active || !native.connected || native.mode === "closed" || !available(button)) return
    validateButtons()
    const action = button.dataset.dialogAction as DialogAction
    const operation = { action, generation: native.generation }
    active = operation
    const focused = dialog.contains(dialog.ownerDocument.activeElement)
    state.restore()
    state.set(dialog, "aria-busy", "true")
    for (const button of buttons) if (!button.disabled) state.set(button, "disabled", "")
    state.set(pendingRegion!, "hidden", null)
    const sessionCurrent = () => !disposed && native.connected && native.mode !== "closed"
      && native.generation === operation.generation
    const current = () => sessionCurrent() && active === operation
    function finish() {
      state.restore()
      active = null
      if (focused && (dialog.ownerDocument.activeElement === dialog.ownerDocument.body
        || dialog.contains(dialog.ownerDocument.activeElement)) && available(button)) button.focus({ preventScroll: true })
    }
    lastAction = new Promise<unknown>(resolve => resolve(callbacks[action]?.(event))).then(result => result !== false)
    void lastAction.then(accepted => {
      if (!current()) return
      finish()
      if (accepted && sessionCurrent()) native.close(action)
    }, error => {
      let stale = !current()
      if (!stale) {
        finish()
        stale = !sessionCurrent()
        if (!stale) state.set(errorRegion!, "hidden", null)
      }
      dialog.dispatchEvent(new view.CustomEvent<DialogError>("mui:dialog-error", { detail: { action, error, stale } }))
    })
  }
  function click(event: MouseEvent) {
    const button = (event.target as Element | null)?.closest?.<HTMLButtonElement>("[data-dialog-action]")
    if (!button || !buttons.includes(button) || active || queued !== null) return
    const generation = native.generation
    // A task observes cancellation by later bubbling listeners, unlike a microtask.
    queued = view.setTimeout(() => {
      queued = null
      if (!event.defaultPrevented && native.generation === generation) {
        try { start(button, event) } catch (error) {
          controller.dispose()
          dialog.dispatchEvent(new view.CustomEvent("mui:dialog-error", {
            detail: { action: button.dataset.dialogAction, error, stale: false },
          }))
        }
      }
    }, 0)
  }
  function disposeActions() {
    if (disposed) return
    disposed = true
    metadata.disconnect()
    invalidate()
    dialog.removeEventListener("click", click)
    dialog.removeEventListener("mui:native-dialog-session", invalidate)
    dialog.removeEventListener("mui:native-dialog-dispose", disposeActions)
  }
  const controller: DialogController = {
    dialog,
    get connected() { return native.connected },
    get mode() { return native.mode },
    get generation() { return native.generation },
    get pending() { return native.connected ? active?.action ?? null : null },
    get lastAction() { return lastAction },
    showModal: opener => native.showModal(opener),
    show: opener => native.show(opener),
    close: value => native.close(value),
    requestClose: value => native.requestClose(value),
    dispose() { disposeActions(); native.dispose() },
  }
  dialog.addEventListener("click", click)
  dialog.addEventListener("mui:native-dialog-session", invalidate)
  dialog.addEventListener("mui:native-dialog-dispose", disposeActions)
  metadata.observe(dialog, { subtree: true, childList: true, attributes: true,
    attributeFilter: ["type", "role", "data-dialog-action", "data-dialog-error", "data-dialog-pending", "command", "commandfor", "popovertarget", "popovertargetaction"],
  })
  return controller
}

export interface DialogTemplateOptions extends DialogOptions {
  title?: string
  content?: string
  positiveText?: string
  negativeText?: string
  type?: "default" | "info" | "success" | "warning" | "error"
  modal?: boolean
}
export interface DialogOwner {
  readonly dialogs: readonly DialogController[]
  create(template: HTMLTemplateElement, options?: DialogTemplateOptions): DialogController
  destroyAll(): void
  dispose(): void
}

/** An explicit collection of owned template clones, not an injected/global service. */
export function createDialogOwner(root: HTMLElement): DialogOwner {
  const view = root?.ownerDocument.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.isConnected) throw new TypeError("Use a connected owner root.")
  const handles = new Set<DialogController>()
  let disposed = false
  let destroying = false
  const owner: DialogOwner = {
    get dialogs() { return [...handles] },
    create(template, options = {}) {
      if (disposed || destroying || !root.isConnected) throw new Error("Dialog owner is unavailable.")
      if (!(template instanceof view.HTMLTemplateElement) || template.content.children.length !== 1
        || template.content.firstElementChild?.localName !== "dialog") throw new TypeError("Author one dialog in a native template.")
      const dialog = template.content.firstElementChild.cloneNode(true) as HTMLDialogElement
      if (dialog.open || dialog.hidden) throw new TypeError("Template dialogs must start closed and not hidden.")
      if (dialog.querySelector("script, style, iframe, object, embed")) {
        throw new TypeError("Dialog templates contain authored content, not executable/embedded documents or styles.")
      }
      const ids = [dialog, ...dialog.querySelectorAll<HTMLElement>("[id]")].map(node => node.id).filter(Boolean)
      if (new Set(ids).size !== ids.length || ids.some(id => root.ownerDocument.getElementById(id))) {
        throw new TypeError("Template IDs must be unique in the document; use aria-label or a fresh template for concurrent clones.")
      }
      if (options.modal !== undefined && typeof options.modal !== "boolean") throw new TypeError("modal must be boolean.")
      if (options.type !== undefined) {
        if (!["default", "info", "success", "warning", "error"].includes(options.type)) throw new TypeError("Unknown Dialog type.")
        dialog.dataset.dialogType = options.type
      }
      for (const [key, selector] of [
        ["title", "[data-dialog-title]"], ["content", "[data-dialog-content]"],
        ["positiveText", '[data-dialog-action="positive"]'], ["negativeText", '[data-dialog-action="negative"]'],
      ] as const) {
        const text = options[key]
        if (text === undefined) continue
        const nodes = [...dialog.querySelectorAll<HTMLElement>(selector)].filter(node => node.closest("dialog") === dialog)
        if (typeof text !== "string" || !text.trim() || nodes.length !== 1 || nodes[0]!.childElementCount) {
          throw new TypeError("Text options need a single text-only template region; no HTML or control replacement.")
        }
        nodes[0]!.textContent = text
      }
      root.append(dialog)
      let handle: DialogController | undefined
      try {
        if (disposed || !root.isConnected) throw new Error("Dialog creation was interrupted.")
        handle = createDialog(dialog, options)
        const owned = handle
        const dispose = owned.dispose
        owned.dispose = () => {
          if (!handles.delete(owned)) return
          dialog.removeEventListener("mui:native-dialog-dispose", owned.dispose)
          dispose()
          dialog.remove()
        }
        handles.add(owned)
        dialog.addEventListener("mui:native-dialog-dispose", owned.dispose)
        if (options.modal === false) handle.show()
        else handle.showModal()
        if (!handle.connected || disposed) throw new Error("Dialog creation was interrupted.")
        return handle
      } catch (error) {
        // Creation errors must not leave a registered native owner behind.
        handle?.dispose()
        dialog.remove()
        throw error
      }
    },
    destroyAll() {
      if (destroying) return
      destroying = true
      try { for (const handle of [...handles].reverse()) handle.dispose() }
      finally { destroying = false }
    },
    dispose() { if (!disposed) { disposed = true; owner.destroyAll() } },
  }
  return owner
}
