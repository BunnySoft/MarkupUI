import { Message } from "./message-element.js"
import { MessageContainer } from "./container.js"
import type { MessageType } from "./model.js"

export interface MessageServiceOptions {
  duration?: number
  closable?: boolean
}

export interface CreateMessageOptions extends MessageServiceOptions {
  type?: MessageType
  content?: string
}

function getOrCreateContainer(): MessageContainer {
  let container = document.querySelector<MessageContainer>("m-message-container")
  if (!container || !container.isConnected) {
    container = document.createElement("m-message-container") as MessageContainer
    document.body.append(container)
  }
  return container
}

export function createMessage(
  contentOrOptions: string | CreateMessageOptions = "",
  options: CreateMessageOptions = {},
): Message {
  const opts = typeof contentOrOptions === "string" ? { ...options, content: contentOrOptions } : contentOrOptions
  const msg = document.createElement("m-message") as Message
  if (opts.type) msg.type = opts.type
  if (opts.content) msg.content = opts.content
  if (opts.duration !== undefined) msg.duration = opts.duration
  if (opts.closable !== undefined) msg.closable = opts.closable
  return msg
}

export const message = {
  create(content: string, options?: MessageServiceOptions & { type?: MessageType }): Message {
    const container = getOrCreateContainer()
    const msg = createMessage(content, options)
    container.append(msg)
    return msg
  },
  info(content: string, options?: MessageServiceOptions): Message {
    return this.create(content, { ...options, type: "info" })
  },
  success(content: string, options?: MessageServiceOptions): Message {
    return this.create(content, { ...options, type: "success" })
  },
  warning(content: string, options?: MessageServiceOptions): Message {
    return this.create(content, { ...options, type: "warning" })
  },
  error(content: string, options?: MessageServiceOptions): Message {
    return this.create(content, { ...options, type: "error" })
  },
  loading(content: string, options?: MessageServiceOptions): Message {
    return this.create(content, { duration: 0, ...options, type: "loading" })
  },
  destroyAll(): void {
    const containers = document.querySelectorAll("m-message-container")
    for (const container of containers) {
      if (container instanceof MessageContainer) {
        container.destroyAll()
      } else {
        container.remove()
      }
    }
    const loose = document.querySelectorAll("m-message")
    for (const msg of loose) {
      if (msg instanceof Message) {
        msg.close()
      } else {
        msg.remove()
      }
    }
  },
}
