export { Modal } from "./modal-element.js"
export { ModalHeader, ModalBody, ModalFooter, ModalAction } from "./regions.js"
export type { ModalCloseDetail, ModalCancelDetail, ModalEventDetail } from "./model.js"
export { createModal, createModalOwner } from "./modal.js"
export type { ModalController, ModalOptions, ModalOwner, ModalTemplateOptions } from "./modal.js"
export type { NativeDialogMode } from "../dialog/native.js"

import { Modal } from "./modal-element.js"
import { ModalHeader, ModalBody, ModalFooter, ModalAction } from "./regions.js"
import { ViewElement } from "../../core/index.js"

export function registerModal(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Modal, ModalHeader, ModalBody, ModalFooter, ModalAction], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Modal.tag)) registerModal()

