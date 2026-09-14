import { Message } from "./message-element.js"
import { MessageContainer } from "./container.js"
import { ViewElement } from "../../core/index.js"

export { Message, MMessage } from "./message-element.js"
export { MessageContainer, MMessageContainer } from "./container.js"
export { message, createMessage } from "./service.js"
export type { MessageServiceOptions, CreateMessageOptions } from "./service.js"
export type { MessageType, MessagePlacement, MessageCloseDetail } from "./model.js"
export { messageTypes, messagePlacements } from "./model.js"

export { createMessageOwner } from "./message.js"
export type {
  MessageError,
  MessageHandle,
  MessageOptions,
  MessageOwner,
  MessageOwnerOptions,
  MessageRemoveReason,
  MessageUpdate,
} from "./message.js"

export function registerMessage(
  registry: Pick<CustomElementRegistry, "get" | "define"> = customElements,
): void {
  ViewElement.register([Message, MessageContainer], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Message.tag)) registerMessage()

