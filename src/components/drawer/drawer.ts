import { createModal, createModalOwner } from "../modal/modal.js"
import type { ModalController, ModalOptions } from "../modal/modal.js"

export type DrawerPlacement = "left" | "right" | "top" | "bottom" | "inline-start" | "inline-end"
export type DrawerOptions = ModalOptions
export type DrawerController = ModalController
export interface DrawerTemplateOptions extends DrawerOptions { mode?: "modal" | "modeless" }
export interface DrawerOwner {
  readonly drawers: readonly DrawerController[]
  create(template: HTMLTemplateElement, options?: DrawerTemplateOptions): DrawerController
  destroyAll(): void
  dispose(): void
}

function validate(dialog: Element | null | undefined) {
  if (dialog?.localName !== "dialog" || !dialog.classList.contains("mui-native-dialog") || !dialog.classList.contains("mui-drawer")) {
    throw new TypeError("Drawer requires an authored native .mui-native-dialog.mui-drawer.")
  }
  const placement = dialog.getAttribute("data-drawer-placement") ?? "right"
  if (!["left", "right", "top", "bottom", "inline-start", "inline-end"].includes(placement)) {
    throw new TypeError("Unknown Drawer placement; physical edges and explicit inline-start/end are supported.")
  }
  const content = dialog.querySelector(":scope > .mui-drawer-content")
  if (!content || dialog.children.length !== 1 || content.querySelectorAll(":scope > [data-drawer-body]").length !== 1
    || content.querySelectorAll(":scope > [data-drawer-header]").length > 1
    || content.querySelectorAll(":scope > [data-drawer-footer]").length > 1) {
    throw new TypeError("Author one DrawerContent wrapper with one direct body and optional direct header/footer.")
  }
}

function bind(handle: DrawerController): DrawerController {
  for (const name of ["show", "showModal"] as const) {
    const open = handle[name]
    handle[name] = opener => { validate(handle.dialog); return open(opener) }
  }
  return handle
}

export function createDrawer(dialog: HTMLDialogElement, options: DrawerOptions = {}): DrawerController {
  validate(dialog)
  return bind(createModal(dialog, options))
}

/** Only authored template content is adopted; Drawer has no render/text/resize service. */
export function createDrawerOwner(root: HTMLElement): DrawerOwner {
  const owner = createModalOwner(root)
  return {
    get drawers() { return owner.modals },
    create(template, options = {}) {
      if (!options || typeof options !== "object"
        || Object.keys(options).some(key => !["closeOnEsc", "backdropDismiss", "mode"].includes(key))) {
        throw new TypeError("Drawer templates accept native policies/mode, not framework, text or resize options.")
      }
      validate(template?.content?.firstElementChild)
      const handle = owner.create(template, options)
      try { validate(handle.dialog); return bind(handle) }
      catch (error) { handle.dispose(); throw error }
    },
    destroyAll: () => owner.destroyAll(),
    dispose: () => owner.dispose(),
  }
}
