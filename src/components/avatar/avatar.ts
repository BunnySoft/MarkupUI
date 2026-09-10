import { MuiElement } from "../../core/element.js"

export class MuiAvatar extends MuiElement {
  public static get observedAttributes(): string[] {
    return ["src", "fallback-src", "alt", "lazy", "size", "object-fit"]
  }

  private image: HTMLImageElement | undefined
  private generatedImage: HTMLImageElement | undefined
  private observer: MutationObserver | undefined
  private resizeObserver: ResizeObserver | undefined
  private readonly textElements = new Set<HTMLElement>()
  private source = ""
  private fallbackImageSource: string | undefined
  private fallbackAttempted = false
  private label: string | undefined
  private managedRole: string | undefined
  private initialLoading: string | null = null
  private upgraded = false
  private connectedOnce = false
  private sizeOverride: string | undefined
  private fitOverride: string | undefined
  private authoredSize = ""
  private authoredFit = ""
  private authoredSizePriority = ""
  private authoredFitPriority = ""
  private state: "empty" | "loading" | "loaded" | "error" = "empty"

  public connectedCallback(): void {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.fitText)
      this.resizeObserver.observe(this, { box: "border-box" })
    }
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["src", "fallbackSrc", "alt", "lazy", "size"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.synchronize()
    if (this.connectedOnce && this.state === "loading" && this.image?.complete && this.image.naturalWidth === 0) {
      this.onError()
    }
    this.connectedOnce = true
    this.observer = new MutationObserver((records) => {
      if (records.some(({ target }) => target === this || target === this.image)) this.synchronize()
      else this.update()
    })
    this.observer.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["src", "alt"] })
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.resizeObserver?.disconnect()
    this.resizeObserver = undefined
    this.textElements.clear()
    this.unlisten()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public get src(): string { return this.getAttribute("src") ?? "" }
  public set src(value: string) { this.setAttribute("src", value) }
  public get fallbackSrc(): string { return this.getAttribute("fallback-src") ?? "" }
  public set fallbackSrc(value: string) { this.setAttribute("fallback-src", value) }
  public get alt(): string { return this.getAttribute("alt") ?? "" }
  public set alt(value: string) { this.setAttribute("alt", value) }
  public get lazy(): boolean { return this.hasAttribute("lazy") }
  public set lazy(value: boolean) { this.toggleAttribute("lazy", value) }
  public get size(): string { return this.getAttribute("size") ?? "medium" }
  public set size(value: string | number) { this.setAttribute("size", String(value)) }

  private synchronize(): void {
    this.prepareContent()
    let image = this.querySelector<HTMLImageElement>(":scope > img") ?? undefined
    if (image === undefined && this.src) {
      image = this.ownerDocument.createElement("img")
      this.generatedImage = image
      this.prepend(image)
    }
    if (image !== this.image) {
      this.unlisten()
      this.image = image
      this.initialLoading = image?.getAttribute("loading") ?? null
      this.source = ""
      this.fallbackImageSource = undefined
      this.fallbackAttempted = false
    }
    image?.addEventListener("load", this.onLoad)
    image?.addEventListener("error", this.onError)

    if (image !== undefined) {
      if (this.hasAttribute("alt") && image.alt !== this.alt) image.alt = this.alt
      if (this.lazy) image.setAttribute("loading", "lazy")
      else if (this.initialLoading !== null) image.setAttribute("loading", this.initialLoading)
      else image.removeAttribute("loading")
      const authoredSource = image.getAttribute("src") ?? ""
      const source = this.hasAttribute("src") || image === this.generatedImage
        ? this.src
        : authoredSource === this.fallbackImageSource ? this.source : authoredSource
      if (source !== this.source) {
        this.source = source
        this.fallbackAttempted = false
        this.fallbackImageSource = undefined
        this.state = source ? "loading" : "empty"
        if (source) image.setAttribute("src", source)
        else image.removeAttribute("src")
      }
      if (source && image.complete && image.naturalWidth > 0) this.state = "loaded"
    } else {
      this.state = "empty"
    }

    const numericSize = Number(this.getAttribute("size"))
    if (Number.isFinite(numericSize) && numericSize > 0) {
      const value = `${numericSize}px`
      if (this.sizeOverride !== value) {
        if (this.style.getPropertyValue("--mui-avatar-size") !== this.sizeOverride
          || this.style.getPropertyPriority("--mui-avatar-size")) {
          this.authoredSize = this.style.getPropertyValue("--mui-avatar-size")
          this.authoredSizePriority = this.style.getPropertyPriority("--mui-avatar-size")
        }
        this.style.setProperty("--mui-avatar-size", value)
        this.sizeOverride = value
      }
    } else if (this.sizeOverride !== undefined) {
      if (this.style.getPropertyValue("--mui-avatar-size") === this.sizeOverride
        && !this.style.getPropertyPriority("--mui-avatar-size")) {
        this.style.setProperty("--mui-avatar-size", this.authoredSize, this.authoredSizePriority)
      }
      this.sizeOverride = undefined
    }
    const fit = this.getAttribute("object-fit")
    if (fit && ["fill", "contain", "cover", "none", "scale-down"].includes(fit)) {
      if (this.fitOverride !== fit) {
        if (this.style.getPropertyValue("--mui-avatar-object-fit") !== this.fitOverride
          || this.style.getPropertyPriority("--mui-avatar-object-fit")) {
          this.authoredFit = this.style.getPropertyValue("--mui-avatar-object-fit")
          this.authoredFitPriority = this.style.getPropertyPriority("--mui-avatar-object-fit")
        }
        this.style.setProperty("--mui-avatar-object-fit", fit)
        this.fitOverride = fit
      }
    } else if (this.fitOverride !== undefined) {
      if (this.style.getPropertyValue("--mui-avatar-object-fit") === this.fitOverride
        && !this.style.getPropertyPriority("--mui-avatar-object-fit")) {
        this.style.setProperty("--mui-avatar-object-fit", this.authoredFit, this.authoredFitPriority)
      }
      this.fitOverride = undefined
    }
    this.update()
  }

  private prepareContent(): void {
    for (const name of ["fallback", "placeholder"]) {
      const selector = `[data-mui-avatar-${name}]`
      const template = this.querySelector<HTMLTemplateElement>(`:scope > template${selector}`)
      if (template && !this.querySelector(`:scope > span${selector}`)) {
        const content = this.ownerDocument.createElement("span")
        content.setAttribute(`data-mui-avatar-${name}`, "")
        content.append(this.ownerDocument.importNode(template.content, true))
        this.append(content)
      }
    }
    const nodes = [...this.childNodes].filter((node) => {
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches(
        "img,template,[data-mui-avatar-content],[data-mui-avatar-fallback],[data-mui-avatar-placeholder]",
      )
    })
    if (nodes.length) {
      let content = this.querySelector<HTMLElement>(":scope > [data-mui-avatar-content]")
      if (!content) {
        content = this.ownerDocument.createElement("span")
        content.dataset.muiAvatarContent = ""
        this.append(content)
      }
      content.append(...nodes)
    }
  }

  private update(): void {
    this.dataset.muiAvatarState = this.state
    if (this.image) this.image.hidden = this.state === "empty" || this.state === "error"
    const fallback = this.querySelector<HTMLElement>(":scope > span[data-mui-avatar-fallback]")
    const placeholder = this.querySelector<HTMLElement>(":scope > span[data-mui-avatar-placeholder]")
    const content = this.querySelector<HTMLElement>(":scope > [data-mui-avatar-content]")
    if (fallback) fallback.hidden = this.state !== "error"
    if (placeholder) placeholder.hidden = this.state !== "loading"
    if (content) content.hidden = this.state === "loaded"
      || (this.state === "error" && fallback !== null)
      || (this.state === "loading" && placeholder !== null)

    const label = this.getAttribute("alt")
      ?? this.image?.getAttribute("alt")
      ?? content?.textContent?.trim()
      ?? ""
    if (!this.hasAttribute("role") || this.getAttribute("role") === this.managedRole) {
      this.managedRole = label ? "img" : "presentation"
      this.setAttribute("role", this.managedRole)
    }
    if (!this.hasAttribute("aria-label") || this.getAttribute("aria-label") === this.label) {
      this.setAttribute("aria-label", label)
      this.label = label
    }
    const elements = new Set([content, fallback, placeholder].filter((element): element is HTMLElement => element !== null))
    for (const element of this.textElements) {
      if (!elements.has(element)) {
        this.resizeObserver?.unobserve(element)
        this.textElements.delete(element)
      }
    }
    for (const element of elements) {
      if (!this.textElements.has(element)) {
        this.textElements.add(element)
        this.resizeObserver?.observe(element)
      }
    }
    this.fitText()
  }

  private readonly fitText = (): void => {
    if (!this.isConnected) return
    const width = this.offsetWidth, height = this.offsetHeight
    if (!width || !height) return
    for (const element of this.textElements) {
      const textWidth = element.offsetWidth, textHeight = element.offsetHeight
      if (element.hidden || !textWidth || !textHeight) continue
      const scale = String(Math.min(width / textWidth * .9, height / textHeight * .9, 1))
      if (element.style.getPropertyValue("--mui-avatar-text-scale") !== scale) {
        element.style.setProperty("--mui-avatar-text-scale", scale)
      }
    }
  }

  private readonly onLoad = (): void => {
    this.state = "loaded"
    this.update()
    this.emit("load", { src: this.image?.currentSrc || this.image?.src || "" })
  }

  private readonly onError = (): void => {
    const failedSrc = this.image?.currentSrc || this.image?.src || ""
    if (this.image && this.fallbackSrc && !this.fallbackAttempted && this.fallbackSrc !== this.source) {
      this.fallbackAttempted = true
      this.state = "loading"
      this.fallbackImageSource = this.fallbackSrc
      this.image.src = this.fallbackSrc
    } else {
      this.state = "error"
    }
    this.update()
    this.emit("error", { src: failedSrc, fallback: this.fallbackAttempted, state: this.state })
  }

  private unlisten(): void {
    this.image?.removeEventListener("load", this.onLoad)
    this.image?.removeEventListener("error", this.onError)
  }
}
