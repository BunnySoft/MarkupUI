import { createNativeDialog } from "../dialog/native.js"
import type { NativeDialogController, NativeDialogOptions } from "../dialog/native.js"

export interface ModalOptions extends NativeDialogOptions {}
export interface ModalController extends NativeDialogController {
  readonly supportsModal: boolean
}
export interface ModalTemplateOptions extends ModalOptions {
  mode?: "modal" | "modeless"
  title?: string
  content?: string
}
export interface ModalOwner {
  readonly modals: readonly ModalController[]
  create(template: HTMLTemplateElement, options?: ModalTemplateOptions): ModalController
  destroyAll(): void
  dispose(): void
}

function validateOptions(options: object, template = false) {
  const allowed = ["closeOnEsc", "backdropDismiss", ...(template ? ["mode", "title", "content"] : [])]
  if (!options || typeof options !== "object" || Object.keys(options).some(key => !allowed.includes(key))) {
    throw new TypeError("Modal accepts native policies, not framework props, callbacks, render or preset objects.")
  }
}

/** Generic native lifetime: no decision footer, form interception or modal polyfill. */
export function createModal(dialog: HTMLDialogElement, options: ModalOptions = {}): ModalController {
  validateOptions(options)
  if (!dialog || dialog.getRootNode() !== dialog.ownerDocument) {
    throw new TypeError("Modal requires a connected light-DOM native dialog.")
  }
  const native = createNativeDialog(dialog, options)
  function live() {
    if (!native.connected) throw new Error("Modal owner has been disposed.")
  }
  const modal: ModalController = {
    dialog,
    get supportsModal() { return typeof dialog.showModal === "function" },
    get connected() { return native.connected },
    get mode() { return native.mode },
    get generation() { return native.generation },
    showModal(opener) {
      live()
      if (!modal.supportsModal) throw new Error("Native modal support is unavailable. Use an explicit modeless or inline alternative.")
      if (native.mode !== "closed" && native.mode !== "modal") {
        throw new Error("Close the modeless surface before requesting a modal opening.")
      }
      return native.showModal(opener)
    },
    show(opener) {
      live()
      if (native.mode === "modal") throw new Error("Close the modal before requesting a modeless opening.")
      return native.show(opener)
    },
    close: value => native.close(value),
    requestClose: value => native.requestClose(value),
    dispose: () => native.dispose(),
  }
  return modal
}

export function createModalOwner(root: HTMLElement): ModalOwner {
  const document = root?.ownerDocument
  const view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || root.getRootNode() !== document) {
    throw new TypeError("Use a connected light-DOM modal owner root.")
  }
  const handles = new Set<ModalController>()
  const openingOrder = new Set<ModalController>()
  let disposed = false
  let destroying = false
  const owner: ModalOwner = {
    get modals() { return [...handles] },
    create(template, options = {}) {
      if (disposed || destroying || root.getRootNode() !== document) throw new Error("Modal owner is unavailable.")
      validateOptions(options, true)
      if (options.mode !== undefined && options.mode !== "modal" && options.mode !== "modeless") {
        throw new TypeError("Template mode must explicitly be modal or modeless.")
      }
      if (!(template instanceof view.HTMLTemplateElement) || template.content.children.length !== 1
        || template.content.firstElementChild?.localName !== "dialog") {
        throw new TypeError("Author exactly one native dialog in a template.")
      }
      const dialog = template.content.firstElementChild.cloneNode(true) as HTMLDialogElement
      if (dialog.open || dialog.hidden || dialog.querySelector("script, style, iframe, object, embed")) {
        throw new TypeError("Templates need closed native content without hidden roots, executable elements or embedded documents.")
      }
      const ids = [dialog, ...dialog.querySelectorAll<HTMLElement>("[id]")].map(node => node.id).filter(Boolean)
      if (new Set(ids).size !== ids.length || ids.some(id => document.getElementById(id))) {
        throw new TypeError("Template IDs must be unique; use distinct IDs or an ID-free aria-label template.")
      }
      for (const name of ["title", "content"] as const) {
        const text = options[name]
        if (text === undefined) continue
        const nodes = [...dialog.querySelectorAll<HTMLElement>(`[data-modal-${name}]`)]
          .filter(node => node.closest("dialog") === dialog)
        if (typeof text !== "string" || !text.trim() || nodes.length !== 1 || nodes[0]!.childElementCount) {
          throw new TypeError("Text options require one nonempty text-only region; authored controls are never replaced.")
        }
        nodes[0]!.textContent = text
      }
      let handle: ModalController | undefined
      try {
        root.append(dialog)
        if (disposed || root.getRootNode() !== document) throw new Error("Modal creation was interrupted.")
        const policies: ModalOptions = {}
        if (options.closeOnEsc !== undefined) policies.closeOnEsc = options.closeOnEsc
        if (options.backdropDismiss !== undefined) policies.backdropDismiss = options.backdropDismiss
        handle = createModal(dialog, policies)
        const owned = handle
        const dispose = owned.dispose
        const touch = () => { openingOrder.delete(owned); openingOrder.add(owned) }
        const beforeToggle = (event: Event) => {
          if (event.target !== dialog || (event as ToggleEvent).newState !== "open") return
          if (disposed || destroying) event.preventDefault()
          else touch()
        }
        for (const name of ["show", "showModal"] as const) {
          const open = owned[name]
          owned[name] = opener => {
            if (disposed || destroying) throw new Error("Modal owner is unavailable.")
            if (!dialog.open) touch()
            return open(opener)
          }
        }
        owned.dispose = () => {
          if (!handles.delete(owned)) return
          openingOrder.delete(owned)
          dialog.removeEventListener("beforetoggle", beforeToggle)
          dialog.removeEventListener("mui:native-dialog-dispose", owned.dispose)
          dispose()
          dialog.remove()
        }
        handles.add(owned)
        dialog.addEventListener("beforetoggle", beforeToggle)
        dialog.addEventListener("mui:native-dialog-dispose", owned.dispose)
        if (options.mode === "modeless") owned.show()
        else owned.showModal()
        if (disposed || !owned.connected) throw new Error("Modal creation was interrupted.")
        return owned
      } catch (error) {
        handle?.dispose()
        dialog.remove()
        throw error
      }
    },
    destroyAll() {
      if (destroying) return
      destroying = true
      try {
        const remaining = new Set(handles)
        while (remaining.size) {
          const focused = document.activeElement?.closest("dialog")
          // Focus-return chains follow opening order, not template creation order.
          const handle = [...remaining].find(item => item.dialog === focused)
            ?? [...openingOrder].reverse().find(item => remaining.has(item) && item.dialog.open)
            ?? [...remaining].at(-1)!
          remaining.delete(handle)
          handle.dispose()
        }
      }
      finally { destroying = false }
    },
    dispose() { if (!disposed) { disposed = true; owner.destroyAll() } },
  }
  return owner
}
