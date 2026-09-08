import { ownedAttributes } from "./attributes.js"

export type NativeDialogMode = "closed" | "modal" | "modeless" | "inline"
export interface NativeDialogOptions {
  closeOnEsc?: boolean
  backdropDismiss?: boolean
}
export interface NativeDialogController {
  readonly dialog: HTMLDialogElement
  readonly connected: boolean
  readonly mode: NativeDialogMode
  readonly generation: number
  showModal(opener?: HTMLElement): NativeDialogMode
  show(opener?: HTMLElement): NativeDialogMode
  close(returnValue?: string): void
  requestClose(returnValue?: string): void
  dispose(): void
}

const ownerKey = Symbol.for("markupui.native-dialog.owner")

export function createNativeDialog(dialog: HTMLDialogElement, options: NativeDialogOptions = {}): NativeDialogController {
  const document = dialog?.ownerDocument
  const view = document?.defaultView
  if (!view || !(dialog instanceof view.HTMLDialogElement) || !dialog.isConnected) {
    throw new TypeError("A connected native HTMLDialogElement is required.")
  }
  const ownedDialog = dialog as HTMLDialogElement & { [ownerKey]?: NativeDialogController }
  if (ownedDialog[ownerKey]) throw new Error("This native dialog already has an owner.")
  for (const value of [options.closeOnEsc, options.backdropDismiss]) {
    if (value !== undefined && typeof value !== "boolean") throw new TypeError("Dialog policies must be boolean.")
  }
  const closeOnEsc = options.closeOnEsc ?? true
  const backdropDismiss = options.backdropDismiss ?? false
  const state = ownedAttributes(document)
  let connected = true
  let disposing = false
  let generation = 0
  let mode: NativeDialogMode = dialog.open ? nativeMode() : "closed"
  let opener: HTMLElement | null = null
  let requesting = false
  let pointer: { event: PointerEvent; outside: boolean } | null = null
  let backdropTimer: number | null = null
  const listeners: (() => void)[] = []
  const observer = new view.MutationObserver(records => reconcile(records))

  function validate() {
    const refs = dialog.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean)
    const named = refs?.length
      ? refs.every(id => document.getElementById(id)?.textContent?.trim())
      : !!dialog.getAttribute("aria-label")?.trim()
    if (!named || ![null, "dialog", "alertdialog"].includes(dialog.getAttribute("role"))
      || dialog.hasAttribute("aria-modal") || dialog.getAttribute("closedby") === "any") {
      throw new TypeError("Name the native dialog; do not duplicate aria-modal or combine closedby=any with this owner.")
    }
  }
  function nativeMode(): NativeDialogMode {
    try { if (dialog.matches(":modal")) return "modal" } catch { /* Older engines lack :modal. */ }
    return "modeless"
  }
  function notify() {
    const token = ++generation
    pointer = null
    if (backdropTimer !== null) view!.clearTimeout(backdropTimer)
    backdropTimer = null
    dialog.dispatchEvent(new view!.CustomEvent("mui:native-dialog-session"))
    return token
  }
  function observe() {
    observer.disconnect()
    if (!connected) return
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] })
    for (let node: Node | null = dialog.parentNode; node; node = node.parentNode) {
      observer.observe(node, { childList: true })
    }
  }
  function reconcile(records = observer.takeRecords()) {
    if (!connected) return
    if (!dialog.isConnected || dialog.ownerDocument !== document) { controller.dispose(); return }
    if (records.some(record => record.type === "attributes"
      || [...record.removedNodes].some(node => node === dialog || node.contains(dialog)))) {
      notify()
      if (!dialog.open) finish()
      else if (mode !== "inline") mode = nativeMode()
    }
    observe()
  }
  function available(node: HTMLElement) {
    return node.isConnected && !node.matches(":disabled") && !node.closest("[hidden], [inert]")
  }
  function finish() {
    const previous = mode
    mode = "closed"
    if (previous === "closed") return
    state.restore()
    const active = document.activeElement
    const destination = opener
    opener = null
    // Let the browser restore focus first; never steal it from another open surface.
    if (destination && available(destination) && (active === document.body || dialog.contains(active))) {
      destination.focus({ preventScroll: true })
    }
  }
  function listen(name: string, listener: EventListener) {
    dialog.addEventListener(name, listener)
    listeners.push(() => dialog.removeEventListener(name, listener))
  }
  function open(modal: boolean, returnTo?: HTMLElement): NativeDialogMode {
    reconcile()
    if (!connected || disposing) throw new Error("Dialog owner has been disposed.")
    validate()
    if (!available(dialog)) throw new Error("Cannot open a hidden or inert dialog.")
    if (returnTo && (returnTo.ownerDocument !== document || dialog.contains(returnTo))) {
      throw new TypeError("The opener must be outside this dialog in the same document.")
    }
    if (dialog.open) return mode
    const opening = notify()
    if (!connected || disposing || opening !== generation) throw new Error("Dialog opening was interrupted.")
    opener = returnTo ?? (document.activeElement instanceof view!.HTMLElement ? document.activeElement : null)
    dialog.returnValue = ""
    if (modal && typeof dialog.showModal === "function") {
      dialog.showModal()
      mode = dialog.open ? "modal" : "closed"
    } else if (typeof dialog.show === "function") {
      dialog.show()
      mode = dialog.open ? "modeless" : "closed"
    } else {
      state.set(dialog, "data-native-dialog-inline", "")
      dialog.open = true
      mode = "inline"
    }
    reconcile(observer.takeRecords().filter(record => record.type !== "attributes"))
    return mode
  }
  function outside(event: PointerEvent): boolean {
    const rect = dialog.getBoundingClientRect()
    return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom)
  }
  const controller: NativeDialogController = {
    dialog,
    get connected() { reconcile(); return connected },
    get generation() { reconcile(); return generation },
    get mode() { reconcile(); return mode },
    showModal: opener => open(true, opener),
    show: opener => open(false, opener),
    close(returnValue) {
      if (!connected) return
      if (returnValue !== undefined && typeof returnValue !== "string") throw new TypeError("returnValue must be text.")
      const closing = notify()
      if (closing !== generation || !connected) return
      if (dialog.open) {
        if (typeof dialog.close === "function") dialog.close(returnValue)
        else {
          if (returnValue !== undefined) dialog.returnValue = returnValue
          dialog.open = false
          finish()
          dialog.dispatchEvent(new view!.Event("close"))
        }
      }
      reconcile(observer.takeRecords().filter(record => record.type !== "attributes"))
      if (!dialog.open) finish()
    },
    requestClose(returnValue) {
      if (!connected || !dialog.open) return
      if (returnValue !== undefined && typeof returnValue !== "string") throw new TypeError("returnValue must be text.")
      requesting = true
      try {
        if (typeof dialog.requestClose === "function") dialog.requestClose(returnValue)
        else if (dialog.dispatchEvent(new view!.Event("cancel", { cancelable: true }))) controller.close(returnValue)
      } finally { requesting = false }
    },
    dispose() {
      if (!connected || disposing) return
      disposing = true
      controller.close()
      connected = false
      observer.disconnect()
      for (const remove of listeners) remove()
      state.restore()
      delete ownedDialog[ownerKey]
      dialog.dispatchEvent(new view!.CustomEvent("mui:native-dialog-dispose"))
    },
  }
  validate()
  ownedDialog[ownerKey] = controller
  listen("beforetoggle", event => {
    if (event.target !== dialog) return
    notify()
    if (!connected || disposing) event.preventDefault()
  })
  listen("close", event => {
    if (event.target === dialog && !dialog.open) { notify(); finish() }
  })
  listen("cancel", event => {
    if (event.target === dialog && !requesting && !closeOnEsc) event.preventDefault()
  })
  if (backdropDismiss) {
    listen("pointerdown", event => {
      const e = event as PointerEvent
      pointer = e.isPrimary && e.button === 0 && mode === "modal" ? { event: e, outside: outside(e) } : null
    })
    listen("pointercancel", () => { pointer = null })
    listen("pointerup", event => {
      const e = event as PointerEvent
      const down = pointer
      const dismiss = down?.event.pointerId === e.pointerId && down.outside && outside(e)
      pointer = null
      if (dismiss && mode === "modal") {
        const clickedGeneration = generation
        backdropTimer = view!.setTimeout(() => {
          backdropTimer = null
          reconcile()
          if (generation !== clickedGeneration || !connected || mode !== "modal"
            || e.defaultPrevented || down.event.defaultPrevented) return
          const request = new view!.CustomEvent("mui:native-dialog-backdrop", { cancelable: true, detail: { event: e } })
          if (dialog.dispatchEvent(request)) controller.requestClose()
        }, 0)
      }
    })
  }
  observe()
  return controller
}
