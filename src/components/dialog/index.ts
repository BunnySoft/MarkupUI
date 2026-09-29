export { createNativeDialog } from "./native.js"
export type { NativeDialogController, NativeDialogMode, NativeDialogOptions } from "./native.js"
export { createDialog, createDialogOwner } from "./dialog.js"
export type { DialogCallback, DialogController, DialogError, DialogOptions, DialogOwner, DialogTemplateOptions } from "./dialog.js"

export { Dialog, dialogTypes } from "./dialog-element.js"
export type { DialogType } from "./dialog-element.js"
export { DialogAction, DialogBody, DialogFooter, DialogHeader } from "./regions.js"

import { Dialog } from "./dialog-element.js"
import { DialogAction, DialogBody, DialogFooter, DialogHeader } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerDialog(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Dialog, DialogHeader, DialogBody, DialogFooter, DialogAction], registry)
}

if (typeof customElements !== "undefined") registerDialog()

