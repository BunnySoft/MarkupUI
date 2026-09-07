export interface OverlayHandle {
  readonly element: HTMLElement
  readonly close: () => void
}

export interface MessageOptions {
  readonly duration?: number
  readonly type?: "default" | "success" | "warning" | "error"
}

export interface NotificationOptions extends MessageOptions {
  readonly title: string
  readonly content?: string
}

function getHost(document: Document, placement: "top" | "top-right"): HTMLElement {
  const selector = `mui-overlay-host[data-placement="${placement}"]`
  const existing = document.querySelector<HTMLElement>(selector)
  if (existing !== null) return existing
  const host = document.createElement("mui-overlay-host")
  host.dataset.placement = placement
  host.setAttribute("aria-live", placement === "top" ? "polite" : "assertive")
  document.body.append(host)
  return host
}

function appendTimed(
  host: HTMLElement,
  element: HTMLElement,
  duration: number,
): OverlayHandle {
  let timer: ReturnType<typeof setTimeout> | undefined
  const close = (): void => {
    if (timer !== undefined) clearTimeout(timer)
    element.remove()
    if (host.childElementCount === 0) host.remove()
  }
  host.append(element)
  if (duration > 0) timer = setTimeout(close, duration)
  return { element, close }
}

export function showMessage(
  content: string,
  options: MessageOptions = {},
  document: Document = globalThis.document,
): OverlayHandle {
  const element = document.createElement("mui-message")
  element.setAttribute("type", options.type ?? "default")
  element.setAttribute("role", options.type === "error" ? "alert" : "status")
  element.textContent = content
  return appendTimed(getHost(document, "top"), element, options.duration ?? 3000)
}

export function showNotification(
  options: NotificationOptions,
  document: Document = globalThis.document,
): OverlayHandle {
  const element = document.createElement("mui-notification")
  element.setAttribute("type", options.type ?? "default")
  element.setAttribute("role", options.type === "error" ? "alert" : "status")
  const title = document.createElement("strong")
  title.textContent = options.title
  element.append(title)
  if (options.content) {
    const content = document.createElement("span")
    content.textContent = options.content
    element.append(content)
  }
  return appendTimed(getHost(document, "top-right"), element, options.duration ?? 5000)
}

export function clearOverlays(document: Document = globalThis.document): void {
  document.querySelectorAll("mui-overlay-host").forEach((host) => host.remove())
}
