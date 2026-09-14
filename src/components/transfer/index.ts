export { Transfer, MTransfer } from "./transfer-element.js"
export type { TransferChangeDetail } from "./transfer-element.js"
export { createTransfer } from "./transfer.js"
export type { TransferOptions, TransferState, TransferController, TransferSide } from "./transfer.js"

import { Transfer } from "./transfer-element.js"
import { ViewElement } from "../../core/index.js"

export function registerTransfer(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Transfer], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Transfer.tag)) registerTransfer()
