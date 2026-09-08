export interface ImagePreviewDetail {
  readonly current: number
  readonly src: string
}

export interface ImagePreviewController {
  readonly connected: boolean
  readonly dialog: HTMLDialogElement | null
  current: number
  show: boolean
  open(target?: number | HTMLAnchorElement, opener?: HTMLElement): boolean
  close(): void
  next(): boolean
  prev(): boolean
  connect(): void
  disconnect(): void
}

interface ImageRecord {
  signature: string
  attempted: boolean
  ownSource: string | null
  probe: HTMLImageElement | null
  generation: number
}

const owners = new WeakMap<HTMLElement, ImagePreviewController>()

function imageUrl(value: string, document: Document): string | null {
  if (!value || value.startsWith("#")) return null
  let url: URL
  try { url = new URL(value, document.baseURI) } catch (error) {
    if (error instanceof TypeError) return null
    throw error
  }
  if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "blob:") return url.href
  return /^data:image\/[a-z0-9.+-]+[;,]/i.test(url.href) ? url.href : null
}

function available(element: HTMLElement): boolean {
  if (!element.isConnected || element.closest("[hidden], [inert]") || element.matches(":disabled")) return false
  const view = element.ownerDocument.defaultView
  if (!view) return true
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = view.getComputedStyle(current)
    if (style.display === "none" || style.visibility === "hidden") return false
  }
  return true
}

function setHidden(element: HTMLElement | null, hidden: boolean): void {
  if (element && element.hidden !== hidden) element.hidden = hidden
}

function sourceSignature(image: HTMLImageElement): string {
  const sources = image.parentElement?.localName === "picture"
    ? [...image.parentElement.querySelectorAll("source")].map(source => [source.getAttribute("srcset"), source.getAttribute("media"), source.getAttribute("sizes"), source.getAttribute("type")])
    : []
  return JSON.stringify([image.getAttribute("src"), image.getAttribute("srcset"), image.getAttribute("sizes"), image.getAttribute("data-image-fallback"), sources])
}

/** Adopts a native gallery and a direct authored dialog template; never renders thumbnails. */
export function createImagePreview(root: HTMLElement): ImagePreviewController {
  if (!root || !root.hasAttribute("data-image-group")) {
    throw new TypeError("Image preview requires an authored data-image-group root.")
  }
  let connected = false
  let dialog: HTMLDialogElement | null = null
  let imagePrototype: HTMLImageElement | null = null
  let fullImage: HTMLImageElement | null = null
  let closeButton: HTMLButtonElement | null = null
  let active: HTMLAnchorElement | null = null
  let opener: HTMLElement | null = null
  let showing = false
  let generation = 0
  let rendered = ""
  let toolbarInitiallyHidden = false
  let rootObserver: MutationObserver | null = null
  let modalObserver: MutationObserver | null = null
  const records = new Map<HTMLImageElement, ImageRecord>()

  const owns = (element: Element): boolean => element.closest("[data-image-group]") === root
  const entries = (): HTMLAnchorElement[] => [...root.querySelectorAll<HTMLAnchorElement>("a[data-image-preview][href]")]
    .filter(link => owns(link) && !dialog?.contains(link) && available(link)
      && !link.hasAttribute("data-preview-disabled") && !link.hasAttribute("download")
      && (!link.target || link.target.toLowerCase() === "_self") && !link.relList.contains("external")
      && imageUrl(link.getAttribute("href") ?? "", root.ownerDocument) !== null)
  const detail = (): ImagePreviewDetail => ({
    current: active ? entries().indexOf(active) : -1,
    src: active ? imageUrl(active.getAttribute("href") ?? "", root.ownerDocument) ?? "" : "",
  })
  const emit = (name: string): void => {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail() }))
  }
  function cancelFullImage(): void {
    generation++
    if (fullImage) {
      fullImage.onload = null
      fullImage.onerror = null
      fullImage.removeAttribute("src")
      fullImage.remove()
      fullImage = null
    }
  }
  function finishClose(): void {
    if (!showing) return
    showing = false
    modalObserver?.disconnect()
    modalObserver = null
    cancelFullImage()
    rendered = ""
    const focused = root.ownerDocument.activeElement
    const otherDialog = focused?.closest("dialog[open]") ?? null
    if (!otherDialog || otherDialog === dialog) {
      const destination = opener && available(opener) ? opener : entries()[0]
      destination?.focus({ preventScroll: true })
    }
    emit("mui:image-close")
    opener = null
  }
  function close(): void {
    if (dialog?.open) dialog.close()
    finishClose()
  }
  function onDialogClose(): void {
    if (!dialog?.open) finishClose()
  }
  function onDialogClick(event: MouseEvent): void {
    if (event.defaultPrevented || (event.target as Node | null)?.nodeType !== 1) return
    const button = (event.target as Element).closest<HTMLButtonElement>("button")
    if (!button || button.closest("dialog") !== dialog || button.disabled) return
    if (button.hasAttribute("data-image-close")) close()
    else if (button.hasAttribute("data-image-next")) navigate(1)
    else if (button.hasAttribute("data-image-prev")) navigate(-1)
  }
  function ensureDialog(): boolean {
    if (dialog?.isConnected) return !dialog.hidden && !!closeButton && !closeButton.disabled && !closeButton.closest("[hidden]")
    const template = root.querySelector<HTMLTemplateElement>(":scope > template[data-image-preview-template]")
    const original = template?.content.querySelector<HTMLDialogElement>("dialog")
    if (!original || typeof original.showModal !== "function" || original.open || original.hidden) return false
    if (original.querySelector("script, style, iframe, object, embed")) return false
    const clone = original.cloneNode(true) as HTMLDialogElement
    const image = clone.querySelector<HTMLImageElement>("img[data-image-full]")
    const closeAction = clone.querySelector<HTMLButtonElement>("button[data-image-close]")
    const toolbar = clone.querySelector<HTMLElement>("[data-image-toolbar]")
    if (!clone.getAttribute("aria-label")?.trim() || !image || !closeAction || closeAction.type !== "button"
      || closeAction.disabled || closeAction.closest("[hidden]")
      || toolbar?.contains(closeAction) || image.hasAttribute("src") || image.hasAttribute("srcset")) return false
    for (const button of clone.querySelectorAll<HTMLButtonElement>("button[data-image-prev], button[data-image-next]")) {
      if (button.type !== "button") return false
    }
    dialog = clone
    closeButton = closeAction
    toolbarInitiallyHidden = toolbar?.hidden ?? false
    imagePrototype = image.cloneNode(false) as HTMLImageElement
    image.remove()
    clone.classList.add("mui-image-preview")
    clone.addEventListener("click", onDialogClick)
    clone.addEventListener("close", onDialogClose)
    root.append(clone)
    return true
  }
  function render(force = false): void {
    if (!dialog || !imagePrototype || !active) return
    const items = entries()
    const index = items.indexOf(active)
    if (index < 0) { close(); return }
    const src = imageUrl(active.getAttribute("href") ?? "", root.ownerDocument)!
    const thumbnail = active.querySelector<HTMLImageElement>("img")
    const alt = active.getAttribute("data-preview-alt") ?? thumbnail?.getAttribute("alt") ?? ""
    const signature = JSON.stringify([src, alt, index])
    const position = dialog.querySelector<HTMLElement>("[data-image-position]")
    const positionText = `Image ${index + 1} of ${items.length}`
    if (position && position.textContent !== positionText) position.textContent = positionText
    for (const button of dialog.querySelectorAll<HTMLButtonElement>("button[data-image-prev], button[data-image-next]")) {
      if (items.length < 2 && root.ownerDocument.activeElement === button) closeButton?.focus()
      button.disabled = items.length < 2
    }
    const toolbar = dialog.querySelector<HTMLElement>("[data-image-toolbar]")
    const hideToolbar = toolbarInitiallyHidden || root.getAttribute("data-show-toolbar") === "false"
    if (hideToolbar && toolbar?.contains(root.ownerDocument.activeElement)) closeButton?.focus()
    setHidden(toolbar, hideToolbar)
    const original = dialog.querySelector<HTMLAnchorElement>("a[data-image-original]")
    if (original) original.href = src
    if (!force && signature === rendered) return
    const changed = signature !== rendered
    rendered = signature
    cancelFullImage()
    const token = generation
    const image = imagePrototype.cloneNode(false) as HTMLImageElement
    image.alt = alt
    fullImage = image
    dialog.dataset.imageState = "loading"
    const error = dialog.querySelector<HTMLElement>("[data-image-preview-error]")
    setHidden(error, true)
    image.onload = () => {
      if (token !== generation || fullImage !== image || !showing || !root.isConnected) return
      dialog!.dataset.imageState = "loaded"
    }
    image.onerror = () => {
      if (token !== generation || fullImage !== image || !showing || !root.isConnected) return
      dialog!.dataset.imageState = "error"
      setHidden(error, false)
    }
    const stage = dialog.querySelector<HTMLElement>("[data-image-stage]") ?? dialog
    stage.append(image)
    image.src = src
    if (changed) emit("mui:image-change")
  }
  function open(target: number | HTMLAnchorElement = active ?? 0, returnTo?: HTMLElement): boolean {
    if (!connected || !available(root)) return false
    // A native close event is queued; callers can reopen before that event is delivered.
    if (showing && (!dialog?.open || !dialog.isConnected)) finishClose()
    const items = entries()
    const selected = typeof target === "number" ? items[target] : target
    if (typeof target === "number" && (!Number.isInteger(target) || target < 0)) throw new RangeError("Image index must be a non-negative integer.")
    if (!selected || !items.includes(selected) || !ensureDialog() || (dialog!.open && !showing)) return false
    active = selected
    if (!showing) {
      opener = returnTo ?? selected
      // Native modal opening must succeed before preventing a link's ordinary navigation.
      dialog!.showModal()
      showing = true
      modalObserver = new MutationObserver(() => {
        if (!root.isConnected) { controller.disconnect(); return }
        if (!available(root) || !active || !entries().includes(active) || (opener && !available(opener)) || !dialog?.isConnected || dialog.hidden) close()
      })
      modalObserver.observe(root.ownerDocument.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "inert"] })
      render(true)
      closeButton!.focus({ preventScroll: true })
      emit("mui:image-open")
    } else render(true)
    return true
  }
  function navigate(step: 1 | -1): boolean {
    if (showing && !dialog?.open) finishClose()
    const items = entries()
    if (!showing || !active || items.length < 2) return false
    const index = items.indexOf(active)
    if (index < 0) { close(); return false }
    active = items[(index + step + items.length) % items.length]!
    render(true)
    emit(step === 1 ? "mui:image-next" : "mui:image-prev")
    return true
  }
  function onClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      || (event.target as Node | null)?.nodeType !== 1) return
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-image-preview]")
    if (link && owns(link) && open(link, link)) event.preventDefault()
  }
  function stopProbe(record: ImageRecord): void {
    record.generation++
    if (record.probe) {
      record.probe.onload = null
      record.probe.onerror = null
      record.probe.removeAttribute("src")
      record.probe = null
    }
  }
  function imageState(image: HTMLImageElement, state: string): void {
    const frame = image.closest<HTMLElement>("[data-image-frame]")
    if (!frame || !owns(frame) || frame.querySelector("img") !== image) return
    if (frame.dataset.imageState !== state) frame.dataset.imageState = state
    setHidden(frame.querySelector<HTMLElement>(":scope > [data-image-placeholder]"), state !== "loading")
    setHidden(frame.querySelector<HTMLElement>(":scope > [data-image-error]"), state !== "error")
  }
  function inspectImage(image: HTMLImageElement, record: ImageRecord): void {
    if (!image.complete) { imageState(image, "loading"); return }
    if (image.naturalWidth > 0) {
      if (record.probe) stopProbe(record)
      imageState(image, "loaded")
      return
    }
    if (!image.getAttribute("src") && !image.getAttribute("srcset")) { imageState(image, "loading"); return }
    imageState(image, "error")
    if (record.attempted || !image.isConnected || image.parentElement?.localName === "picture" || image.hasAttribute("srcset")) return
    record.attempted = true
    const url = imageUrl(image.getAttribute("data-image-fallback") ?? "", root.ownerDocument)
    if (!url || url === image.src) return
    const token = record.generation
    const signature = record.signature
    const probe = root.ownerDocument.createElement("img")
    for (const name of ["crossorigin", "referrerpolicy", "decoding"]) {
      const value = image.getAttribute(name)
      if (value !== null) probe.setAttribute(name, value)
    }
    record.probe = probe
    probe.onload = () => {
      if (!connected || !image.isConnected || !owns(image) || records.get(image) !== record
        || record.generation !== token || sourceSignature(image) !== signature || image.naturalWidth > 0) return
      stopProbe(record)
      record.ownSource = url
      image.src = url
      record.signature = sourceSignature(image)
      imageState(image, "loading")
    }
    probe.onerror = () => {
      if (record.generation === token) stopProbe(record)
    }
    probe.src = url
  }
  function reconcile(changes: MutationRecord[] = []): void {
    if (!connected) return
    if (!root.isConnected) { controller.disconnect(); return }
    const images = [...root.querySelectorAll<HTMLImageElement>("img")].filter(image => owns(image) && !dialog?.contains(image))
    for (const [image, record] of records) {
      if (!images.includes(image)) { stopProbe(record); records.delete(image) }
    }
    for (const image of images) {
      const signature = sourceSignature(image)
      let record = records.get(image)
      if (!record) {
        record = { signature, attempted: false, ownSource: null, probe: null, generation: 0 }
        records.set(image, record)
      }
      const sourceChanged = changes.some(change => change.type === "attributes" && change.target === image && ["src", "srcset", "sizes", "data-image-fallback"].includes(change.attributeName ?? ""))
      if (sourceChanged && record.ownSource === image.getAttribute("src")) record.ownSource = null
      else if (signature !== record.signature || sourceChanged) {
        stopProbe(record)
        record.signature = signature
        record.attempted = false
        record.ownSource = null
      }
      inspectImage(image, record)
    }
    if (showing) {
      if (!active || !entries().includes(active) || !dialog?.isConnected || dialog.hidden || (opener && !available(opener))) {
        close()
        if (active && !entries().includes(active)) active = null
      }
      else render()
    }
  }
  function onImageEvent(event: Event): void {
    const image = event.target as HTMLImageElement
    if (image.localName !== "img" || !owns(image) || dialog?.contains(image)) return
    reconcile()
  }
  const controller: ImagePreviewController = {
    get connected() { return connected },
    get dialog() { return dialog },
    get current() { return active ? entries().indexOf(active) : 0 },
    set current(index: number) {
      if (showing && !dialog?.open) finishClose()
      const items = entries()
      if (!Number.isInteger(index) || index < 0 || !items[index]) throw new RangeError("Image index is outside this group.")
      active = items[index]!
      if (showing) render(true)
    },
    get show() { return showing && !!dialog?.open },
    set show(value: boolean) {
      if (typeof value !== "boolean") throw new TypeError("Image show must be a boolean.")
      if (value) { if (!open()) throw new Error("Native image preview is unavailable for this group.") }
      else close()
    },
    open,
    close,
    next: () => navigate(1),
    prev: () => navigate(-1),
    connect() {
      if (connected) return
      if (!root.isConnected) throw new Error("Connect the image group after inserting its native root.")
      const owner = owners.get(root)
      if (owner && owner !== controller) throw new Error("This image group already has a preview owner.")
      owners.set(root, controller)
      connected = true
      root.addEventListener("click", onClick)
      root.addEventListener("load", onImageEvent, true)
      root.addEventListener("error", onImageEvent, true)
      rootObserver = new MutationObserver(changes => {
        const relevant = changes.filter(change => !dialog?.contains(change.target) || change.target === dialog)
        if (relevant.length) reconcile(relevant)
      })
      rootObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "target", "rel", "download", "hidden", "inert", "data-image-group", "data-preview-disabled", "data-preview-alt", "data-show-toolbar", "data-image-fallback", "src", "srcset", "sizes", "media", "type", "alt"] })
      reconcile()
    },
    disconnect() {
      if (!connected) return
      connected = false
      close()
      root.removeEventListener("click", onClick)
      root.removeEventListener("load", onImageEvent, true)
      root.removeEventListener("error", onImageEvent, true)
      rootObserver?.disconnect()
      rootObserver = null
      modalObserver?.disconnect()
      modalObserver = null
      for (const record of records.values()) stopProbe(record)
      records.clear()
      if (dialog) {
        dialog.removeEventListener("click", onDialogClick)
        dialog.removeEventListener("close", onDialogClose)
        dialog.remove()
      }
      dialog = null
      imagePrototype = null
      closeButton = null
      if (owners.get(root) === controller) owners.delete(root)
    },
  }
  controller.connect()
  return controller
}
