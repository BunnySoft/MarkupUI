import { Notification } from "./notification-element.js"
import { NotificationContainer } from "./container.js"
import type { NotificationPlacement, NotificationType } from "./model.js"

export interface NotificationServiceOptions {
  title?: string
  description?: string
  content?: string
  type?: NotificationType
  duration?: number
  closable?: boolean
  placement?: NotificationPlacement
  onClose?: () => void
}

function getOrCreateContainer(placement: NotificationPlacement = "top-right"): NotificationContainer {
  let container = document.querySelector<NotificationContainer>(`m-notification-container[placement="${placement}"]`)
  if (!container && placement === "top-right") {
    container = document.querySelector<NotificationContainer>("m-notification-container:not([placement])")
  }
  if (!container || !container.isConnected) {
    container = document.createElement("m-notification-container") as NotificationContainer
    container.placement = placement
    document.body.append(container)
  }
  return container
}

export function createNotification(
  optionsOrTitle: string | NotificationServiceOptions = {},
  extraOptions: NotificationServiceOptions = {},
): Notification {
  const opts = typeof optionsOrTitle === "string" ? { ...extraOptions, title: optionsOrTitle } : optionsOrTitle
  const item = document.createElement("m-notification") as Notification
  if (opts.title) item.title = opts.title
  if (opts.description) item.description = opts.description
  if (opts.content) item.content = opts.content
  if (opts.type) item.type = opts.type
  if (opts.duration !== undefined) item.duration = opts.duration
  if (opts.closable !== undefined) item.closable = opts.closable
  if (opts.onClose) {
    item.addEventListener("m:close", () => { opts.onClose?.() }, { once: true })
  }
  return item
}

export const notification = {
  create(options?: string | NotificationServiceOptions): Notification {
    const item = createNotification(options)
    const opts = typeof options === "string" ? {} : options ?? {}
    const container = getOrCreateContainer(opts.placement ?? "top-right")
    container.append(item)
    return item
  },
  info(options?: string | NotificationServiceOptions): Notification {
    const opts: NotificationServiceOptions = typeof options === "string" ? { content: options } : { ...options }
    opts.type = "info"
    return this.create(opts)
  },
  success(options?: string | NotificationServiceOptions): Notification {
    const opts: NotificationServiceOptions = typeof options === "string" ? { content: options } : { ...options }
    opts.type = "success"
    return this.create(opts)
  },
  warning(options?: string | NotificationServiceOptions): Notification {
    const opts: NotificationServiceOptions = typeof options === "string" ? { content: options } : { ...options }
    opts.type = "warning"
    return this.create(opts)
  },
  error(options?: string | NotificationServiceOptions): Notification {
    const opts: NotificationServiceOptions = typeof options === "string" ? { content: options } : { ...options }
    opts.type = "error"
    return this.create(opts)
  },
  destroyAll(): void {
    const containers = document.querySelectorAll("m-notification-container")
    for (const container of containers) {
      if (container instanceof NotificationContainer) {
        container.destroyAll()
      } else {
        container.remove()
      }
    }
    const loose = document.querySelectorAll("m-notification")
    for (const item of loose) {
      if (item instanceof Notification) {
        item.close()
      } else {
        item.remove()
      }
    }
  },
}
